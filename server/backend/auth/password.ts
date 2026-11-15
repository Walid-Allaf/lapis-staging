import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { AuthError, unavailable } from "./errors";

// OWASP alternative when native Argon2 compatibility on the shared host is unverified.
const N = 32768, r = 8, p = 3;
let active = 0;
const waiting: Array<() => void> = [];
async function derive(password: string, salt: Buffer): Promise<Buffer> {
  if (active >= 2) {
    if (waiting.length >= 16) throw unavailable();
    await new Promise<void>(resolve => waiting.push(resolve));
  } else active++;
  try {
    return await new Promise<Buffer>((resolve, reject) => {
      scrypt(password, salt, 32, { N, r, p, maxmem: 64 * 1024 * 1024 }, (error, value) => error ? reject(unavailable()) : resolve(value));
    });
  } finally {
    const next = waiting.shift();
    if (next) next(); else active--;
  }
}
export function checkPasswordPolicy(password: string): void {
  // Explicit NEW policy, separate from Swagger shape validation. See AUTH_API_CONTRACTS.
  if (Array.from(password).length < 12 || Buffer.byteLength(password, "utf8") > 1024 || !password.trim()) {
    throw new AuthError(400, "AUTH_PASSWORD_POLICY", "Use a password of at least 12 characters (at most 1024 UTF-8 bytes).");
  }
}
export async function hashPassword(password: string): Promise<string> {
  checkPasswordPolicy(password);
  const salt = randomBytes(16);
  const hash = await derive(password, salt);
  return `$scrypt$v1$${N}$${r}$${p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}
export async function verifyPassword(password: string, encoded: string | null): Promise<boolean> {
  if (Buffer.byteLength(password, "utf8") > 1024) return false;
  const parts = encoded?.split("$");
  const valid = parts?.length === 8 && parts[1] === "scrypt" && parts[2] === "v1" && parts[3] === String(N) && parts[4] === String(r) && parts[5] === String(p);
  const salt = valid ? Buffer.from(parts[6], "base64") : Buffer.alloc(16);
  const expected = valid ? Buffer.from(parts[7], "base64") : Buffer.alloc(32);
  const safe = valid && salt.length === 16 && expected.length === 32;
  // Equal-cost dummy work for unknown identities/unrecognized hashes; never trust DB costs.
  const actual = await derive(password, safe ? salt : Buffer.alloc(16));
  return Boolean(safe && timingSafeEqual(actual, expected));
}
