import "server-only";
import { cookies } from "next/headers";
import { type NextResponse } from "next/server";
import { expiryTime, isAdminRole } from "@/dashboard/api/auth";
import { SESSION_COOKIE_NAME, type DashboardSession } from "@/dashboard/api/session-contract";
import { verifyDashboardToken } from "@/server/integration/dashboard-session";

// Leave headroom for the cookie name and attributes under the usual 4 KiB cap.
export const MAX_SESSION_TOKEN_BYTES = 3500;

export function decodeAdminSession(token: string | undefined): DashboardSession | null {
  if (!token || Buffer.byteLength(token, "utf8") > MAX_SESSION_TOKEN_BYTES || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) return null;
  try {
    const claims: Record<string, unknown> = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    const role = claims.role ?? claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const id = claims.sub ?? claims.id ?? claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const email = claims.email ?? claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ?? claims.unique_name;
    if (!isAdminRole(role) || typeof id !== "string" || !id || typeof email !== "string" || !email || typeof claims.exp !== "number" || !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now()) return null;
    if (typeof claims.nbf === "number" && claims.nbf * 1000 > Date.now()) return null;
    return { user: { id, email, role: role as string | number }, expiresOn: new Date(claims.exp * 1000).toISOString() };
  } catch { return null; }
}

// Decoder is a projection utility only. Actual sessions verify signatures AND SQL state.
export async function readAdminSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return verifyDashboardToken(token);
}

function attributes() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/dashboard" };
}

export function setSessionCookie(response: NextResponse, token: string, expiresOn: string) {
  const expiresAt = expiryTime(expiresOn);
  response.cookies.set(SESSION_COOKIE_NAME, token, { ...attributes(), expires: new Date(expiresAt), maxAge: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", { ...attributes(), maxAge: 0, expires: new Date(0) });
}
