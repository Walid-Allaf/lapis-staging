import "server-only";
import { randomUUID, createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { AuthConfig } from "./config";
import { invalidCredentials, unavailable } from "./errors";

export const CLAIMS = {
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  role: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
} as const;
export const hashTokenId = (value: string) => createHash("sha256").update(value).digest();
export interface VerifiedIdentity { id: string; email: string; role: string | number; version: number; jti: string; exp: number }

export async function signIdentity(config: AuthConfig, identity: Omit<VerifiedIdentity, "jti" | "exp">, now = Math.floor(Date.now() / 1000)) {
  const jti = randomUUID();
  const exp = now + config.ttlSeconds;
  const token = await new SignJWT({ email: identity.email, role: identity.role, id: identity.id, sv: identity.version,
    [CLAIMS.id]: identity.id, [CLAIMS.email]: identity.email, [CLAIMS.role]: identity.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT", kid: config.activeKid }).setSubject(identity.id)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt(now).setNotBefore(now).setExpirationTime(exp).setJti(jti)
    .sign(config.keys.get(config.activeKid)!);
  if (Buffer.byteLength(token) > 3500) throw unavailable();
  return { token, jti, exp, expiresOn: new Date(exp * 1000).toISOString() };
}
export async function verifyIdentity(config: AuthConfig, token: string): Promise<VerifiedIdentity> {
  try {
    if (Buffer.byteLength(token) > 3500) throw invalidCredentials();
    const { payload } = await jwtVerify(token, header => {
      if (header.alg !== "HS256" || header.typ !== "JWT" || !header.kid || !config.keys.has(header.kid)) throw invalidCredentials();
      return config.keys.get(header.kid)!;
    }, { algorithms: ["HS256"], issuer: config.issuer, audience: config.audience,
      requiredClaims: ["exp", "nbf", "iat", "jti"], clockTolerance: 0 });
    const id = payload.sub ?? payload.id ?? payload[CLAIMS.id];
    const email = payload.email ?? payload[CLAIMS.email] ?? payload.unique_name;
    const role = payload.role ?? payload[CLAIMS.role];
    if (typeof id !== "string" || !id || typeof email !== "string" || !email ||
      !["string", "number"].includes(typeof role) || role === "" ||
      !Number.isInteger(payload.sv) || Number(payload.sv) < 0 || typeof payload.jti !== "string" || !payload.jti ||
      typeof payload.exp !== "number" || typeof payload.iat !== "number" || payload.iat > Math.floor(Date.now() / 1000)) throw invalidCredentials();
    for (const [key, value] of [["id", id], [CLAIMS.id, id], [CLAIMS.email, email], [CLAIMS.role, role]] as const) {
      if (payload[key] !== undefined && payload[key] !== value) throw invalidCredentials();
    }
    return { id, email, role: role as string | number, version: Number(payload.sv), jti: payload.jti, exp: payload.exp };
  } catch { throw invalidCredentials(); }
}
