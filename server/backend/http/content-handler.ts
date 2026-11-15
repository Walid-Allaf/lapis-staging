import "server-only";
import { ZodError } from "zod";
import { getPool } from "../db/pool";
import { AuthError, invalidCredentials } from "../auth/errors";
import { ContentError, invalidContent } from "../modules/content/errors";
import { resources } from "../modules/content/definitions";
import { AdsUpdate, SettingUpdate } from "../modules/content/validation";
import { ContentService } from "../modules/content/service";
import { parseContentFilters, parseContentId } from "../modules/content/query";
import type { ContentResult, ResourceName } from "../modules/content/types";
import { invalidateContent } from "../../integration/invalidation";

type Factory = () => Promise<ContentService>;
export type ResourceAction = "list" | "detail" | "slug" | "create" | "update" | "delete";
export type SingletonAction = "settings-public" | "settings-get" | "settings-edit" | "statistics" | "ads-public" | "ads-get" | "ads-edit";
export const contentMethods = { list: "GET", detail: "GET", slug: "GET", create: "POST", update: "PUT", delete: "DELETE" } as const;
const factory: Factory = async () => new ContentService(await getPool());
const commonHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

function tokenFrom(request: Request): string | undefined {
  const value = request.headers.get("authorization");
  if (!value) return undefined;
  const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(value);
  if (!match || Buffer.byteLength(match[1]) > 3500) throw invalidCredentials();
  return match[1];
}
async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) return {};
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4 * 1024 * 1024) { await reader.cancel(); throw new ContentError(413, "CONTENT_BODY_TOO_LARGE", "Request is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (!size) return {};
  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!/^(?:application\/(?:json|[a-z0-9!#$&^_.+-]+\+json)|text\/json)$/.test(type)) throw new ContentError(415, "CONTENT_CONTENT_TYPE", "JSON content is required.");
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))); }
  catch { throw invalidContent(); }
}
function success(result: ContentResult): Response {
  return Response.json({ isSuccess: true, data: result.data, error: null, paging: result.paging ?? null }, { headers: commonHeaders });
}
function failure(request: Request, error: unknown, method: string): Response {
  const safe = error instanceof ContentError || error instanceof AuthError ? error : error instanceof ZodError ? invalidContent() :
    new ContentError(503, "CONTENT_UNAVAILABLE", "Content is temporarily unavailable.");
  const arabic = request.headers.get("accept-language")?.split(/[,-]/)[0].trim() === "ar";
  const messages: Record<number, string> = { 400: "بيانات الطلب غير صالحة", 401: "يرجى تسجيل الدخول", 403: "ليس لديك صلاحية لهذا الإجراء",
    404: "المحتوى غير موجود", 409: "يتعذر تنفيذ الإجراء بسبب ارتباطات المحتوى", 413: "حجم الطلب أكبر من الحد المسموح", 503: "المحتوى غير متاح مؤقتًا" };
  const message = arabic ? messages[safe.status] ?? safe.publicMessage : safe.publicMessage;
  return Response.json({ isSuccess: false, data: null, error: { code: safe.code, message, details: null }, paging: null, message },
    { status: safe.status, headers: { ...commonHeaders, ...(safe.status === 405 ? { Allow: method } : {}) } });
}
function methodCheck(request: Request, expected: string): void {
  if (request.method !== expected) throw new ContentError(405, "CONTENT_METHOD_NOT_ALLOWED", "Method not allowed.");
}
async function requireEmptyBody(request: Request): Promise<void> {
  const reader = request.body?.getReader();
  if (!reader) return;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      if (value.length) { await reader.cancel(); throw invalidContent(); }
    }
  } finally { reader.releaseLock(); }
}
export function createResourceHandler(resourceName: ResourceName, action: ResourceAction, serviceFactory: Factory = factory) {
  return async (request: Request, parameter?: string): Promise<Response> => {
    const method = contentMethods[action];
    try {
      methodCheck(request, method);
      const token = tokenFrom(request);
      const mutation = ["create", "update", "delete"].includes(action);
      if (mutation && !token) throw invalidCredentials();
      if (!["create", "update"].includes(action)) await requireEmptyBody(request);
      const resource = resources[resourceName];
      const body = action === "create" || action === "update" ? await readBody(request) : undefined;
      // Schema checks occur before opening SQL; services validate again for internal callers.
      if (action === "create") resource.create.parse(body);
      if (action === "update") resource.update.parse(body);
      const id = ["detail", "update", "delete"].includes(action) ? parseContentId(parameter ?? "") : undefined;
      if (action === "slug" && (resourceName !== "BlogPosts" || !parameter)) throw invalidContent();
      const filters = action === "list" ? parseContentFilters(request.url, resource) : undefined;
      const service = await serviceFactory();
      let result: ContentResult;
      switch (action) {
        case "list": result = await service.list(resource, filters!, token); break;
        case "detail": result = await service.detail(resource, { id: id! }, token); break;
        case "slug": result = await service.detail(resource, { slug: parameter! }, token); break;
        case "create": result = await service.create(resource, body, token); break;
        case "update": result = await service.update(resource, id!, body, token); break;
        case "delete": result = await service.remove(resource, id!, token); break;
      }
      if (mutation) invalidateContent(request, resourceName);
      return success(result);
    } catch (error) { return failure(request, error, method); }
  };
}
export function createSingletonHandler(action: SingletonAction, serviceFactory: Factory = factory) {
  return async (request: Request): Promise<Response> => {
    const method = action.endsWith("-edit") ? "PUT" : "GET";
    try {
      methodCheck(request, method);
      const token = tokenFrom(request);
      if (!action.endsWith("-public") && !token) throw invalidCredentials();
      if (method === "GET") await requireEmptyBody(request);
      const body = method === "PUT" ? await readBody(request) : undefined;
      if (action === "settings-edit") SettingUpdate.parse(body);
      if (action === "ads-edit") AdsUpdate.parse(body);
      const service = await serviceFactory();
      let result: ContentResult;
      switch (action) {
        case "settings-public": result = await service.getSettings(token, true); break;
        case "settings-get": result = await service.getSettings(token); break;
        case "settings-edit": result = await service.editSettings(body, token); break;
        case "ads-public": result = await service.getAds(token, true); break;
        case "ads-get": result = await service.getAds(token); break;
        case "ads-edit": result = await service.editAds(body, token); break;
        case "statistics": result = await service.statistics(token); break;
      }
      if (method === "PUT") invalidateContent(request, action === "settings-edit" ? "Setting" : "Ads");
      return success(result);
    } catch (error) { return failure(request, error, method); }
  };
}
