import "server-only";
import { unavailable } from "./errors";

export interface AuthConfig {
  keys: ReadonlyMap<string, Uint8Array>;
  activeKid: string;
  issuer: string;
  audience: string;
  otpKey: Buffer;
  ttlSeconds: number;
}
function secret(raw: unknown): Buffer {
  if (typeof raw !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) throw unavailable();
  const decoded = Buffer.from(raw, "base64");
  if (decoded.length < 32 || decoded.toString("base64") !== raw) throw unavailable();
  return decoded;
}
export function readAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  try {
    const values: unknown = JSON.parse(env.AUTH_JWT_KEYS ?? "");
    if (!values || typeof values !== "object" || Array.isArray(values)) throw unavailable();
    const entries = Object.entries(values);
    if (!entries.length || entries.length > 10) throw unavailable();
    const keys = new Map<string, Uint8Array>();
    for (const [kid, value] of entries) {
      if (!/^[A-Za-z0-9_-]{1,40}$/.test(kid)) throw unavailable();
      keys.set(kid, secret(value));
    }
    const activeKid = env.AUTH_JWT_ACTIVE_KID ?? "";
    const issuer = env.AUTH_JWT_ISSUER ?? "";
    const audience = env.AUTH_JWT_AUDIENCE ?? "";
    const ttlSeconds = Number(env.AUTH_TOKEN_TTL_SECONDS ?? "900");
    if (!keys.has(activeKid) || !issuer.trim() || !audience.trim() || !Number.isInteger(ttlSeconds) || ttlSeconds < 60 || ttlSeconds > 3600) throw unavailable();
    const otpKey = secret(env.AUTH_OTP_KEY);
    if ([...keys.values()].some(key => Buffer.from(key).equals(otpKey))) throw unavailable();
    return { keys, activeKid, issuer, audience, otpKey, ttlSeconds };
  } catch { throw unavailable(); }
}
