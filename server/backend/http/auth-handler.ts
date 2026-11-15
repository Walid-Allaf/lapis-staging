import "server-only";
import { createHash } from "node:crypto";
import { ZodError } from "zod";
import { z } from "zod";
import { getPool } from "../db/pool";
import { readAuthConfig } from "../auth/config";
import { smtpMailAdapter } from "../auth/mail";
import { AuthError } from "../auth/errors";
import { AuthenticationService, type ActionResult } from "../modules/auth/service";
import { UserService, type UserFilters } from "../modules/users/service";
import { authSchemas, userSchemas } from "../modules/auth/validation";
import { event } from "../modules/auth/repository";

export type AuthOperation = keyof typeof authSchemas;
export type UserOperation = keyof typeof userSchemas | "get-all" | "get-info" | "get-by-id";
type Factory = () => Promise<AuthenticationService>;
export async function runtimeAuthentication(): Promise<AuthenticationService> {
  const config = readAuthConfig();
  return new AuthenticationService(await getPool(), config, () => smtpMailAdapter());
}
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
function bearer(request: Request): string | undefined {
  const value = request.headers.get("authorization");
  if (!value) return undefined;
  const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(value);
  if (!match || Buffer.byteLength(match[1]) > 3500) throw new AuthError(401, "AUTH_INVALID_CREDENTIALS", "Invalid credentials or verification.");
  return match[1];
}
async function jsonBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) return {};
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 16384) { await reader.cancel(); throw new AuthError(413, "AUTH_BODY_TOO_LARGE", "Request is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (!length) return {};
  const contentType = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!/^(?:application\/(?:json|[a-z0-9!#$&^_.+-]+\+json)|text\/json)$/.test(contentType)) throw new AuthError(415, "AUTH_CONTENT_TYPE", "JSON content is required.");
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))); }
  catch { throw new AuthError(400, "AUTH_INVALID_REQUEST", "Invalid request."); }
}
const queryInteger = z.string().regex(/^-?\d+$/).transform(Number).pipe(z.int32());
const boolean = z.enum(["true", "false"]).transform(value => value === "true");
const filterSchema = z.object({ PageNumber: queryInteger.pipe(z.number().min(1)).default(1), PageSize: queryInteger.pipe(z.number().min(1).max(100)).default(10),
  Search: z.string().optional(), "Sort.Field": queryInteger.pipe(z.number().min(0).max(4)).default(4),
  "Sort.Descending": boolean.default(true), IsActive: boolean.optional() });
export function parseUserFilters(url: string): UserFilters {
  const params = new URL(url).searchParams;
  for (const key of ["PageNumber", "PageSize", "Search", "Sort.Field", "Sort.Descending", "IsActive"]) {
    if (params.getAll(key).length > 1) throw new AuthError(400, "AUTH_INVALID_REQUEST", "Invalid request.");
  }
  const parsed = filterSchema.parse(Object.fromEntries(params));
  return { pageNumber: parsed.PageNumber, pageSize: parsed.PageSize, search: parsed.Search, sort: parsed["Sort.Field"], descending: parsed["Sort.Descending"], isActive: parsed.IsActive };
}
const arabic: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "بيانات الدخول أو التحقق غير صالحة",
  AUTH_INVALID_VERIFICATION: "رمز التحقق غير صالح أو منتهي الصلاحية",
  AUTH_FORBIDDEN: "ليس لديك صلاحية لهذا الإجراء",
  AUTH_INVALID_REQUEST: "بيانات الطلب غير صالحة",
  AUTH_UNAVAILABLE: "خدمة المصادقة غير متاحة مؤقتًا",
  AUTH_RATE_LIMIT: "يرجى المحاولة لاحقًا",
};
function failure(request: Request, error: unknown): Response {
  const safe = error instanceof AuthError ? error : error instanceof ZodError ? new AuthError(400, "AUTH_INVALID_REQUEST", "Invalid request.") : new AuthError(503, "AUTH_UNAVAILABLE", "Authentication is temporarily unavailable.");
  const message = request.headers.get("accept-language")?.split(/[,-]/)[0].trim() === "ar" ? arabic[safe.code] ?? safe.publicMessage : safe.publicMessage;
  return Response.json({ isSuccess: false, data: null, error: { code: safe.code, message, details: null }, paging: null, message },
    { status: safe.status, headers: { ...headers, ...(safe.status === 429 ? { "Retry-After": "60" } : {}) } });
}
function success(result: ActionResult): Response {
  return Response.json({ isSuccess: true, data: result.data, error: null, paging: result.paging ?? null }, { headers });
}
async function denialAudit(service: AuthenticationService | undefined, operation: string, error: unknown): Promise<void> {
  if (service && error instanceof AuthError && [401, 403, 501].includes(error.status)) {
    await event(service.pool, `Api:${operation}`, "denied").catch(() => undefined);
  }
}
export function createAuthHandler(operation: AuthOperation, factory: Factory = runtimeAuthentication) {
  return async (request: Request): Promise<Response> => {
    let service: AuthenticationService | undefined;
    try {
      const body = await jsonBody(request);
      // Validate before constructing SQL connections or accessing SMTP.
      const parsed = authSchemas[operation].parse(body);
      service = await factory();
      let result: ActionResult;
      switch (operation) {
        case "register": result = await service.register(authSchemas.register.parse(parsed)); break;
        case "login": result = await service.login(authSchemas.login.parse(parsed)); break;
        case "confirm-email": result = await service.confirmEmail(authSchemas["confirm-email"].parse(parsed)); break;
        case "send-otp": result = await service.sendOtp(authSchemas["send-otp"].parse(parsed)); break;
        case "verify-otp": result = await service.verifyOtp(authSchemas["verify-otp"].parse(parsed)); break;
        case "reset-password": result = await service.resetPassword(authSchemas["reset-password"].parse(parsed)); break;
        case "toggle-2fa": {
          const token = bearer(request);
          await service.limit("protected", createHash("sha256").update(token ?? "").digest("hex"), 60, 60);
          result = await service.toggleTwoFactor(token); break;
        }
      }
      return success(result);
    } catch (error) { await denialAudit(service, operation, error); return failure(request, error); }
  };
}
export function createUserHandler(operation: UserOperation, factory: Factory = runtimeAuthentication) {
  return async (request: Request, id?: string): Promise<Response> => {
    let service: AuthenticationService | undefined;
    try {
      const token = bearer(request);
      if (!token) throw new AuthError(401, "AUTH_INVALID_CREDENTIALS", "Invalid credentials or verification.");
      const body = operation in userSchemas ? await jsonBody(request) : {};
      service = await factory();
      await service.limit("protected", createHash("sha256").update(token).digest("hex"), 60, 60);
      const users = new UserService(service);
      let result: ActionResult;
      switch (operation) {
        case "get-info": result = await users.getInfo(token); break;
        case "get-by-id": if (!id) throw new AuthError(404, "USER_NOT_FOUND", "User not found."); result = await users.getById(token, id); break;
        case "get-all": result = await users.getAll(token, parseUserFilters(request.url)); break;
        case "edit-profile": result = await users.editProfile(token, userSchemas["edit-profile"].parse(body)); break;
        case "change-password": result = await users.changePassword(token, userSchemas["change-password"].parse(body)); break;
        case "toggle-disable": result = await users.toggleDisable(token, userSchemas["toggle-disable"].parse(body).email); break;
      }
      return success(result);
    } catch (error) { await denialAudit(service, operation, error); return failure(request, error); }
  };
}
