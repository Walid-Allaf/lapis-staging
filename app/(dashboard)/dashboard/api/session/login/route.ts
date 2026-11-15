import { type NextRequest } from "next/server";
import { expiryTime, isAdminRole } from "@/dashboard/api/auth";
import { setSessionCookie, clearSessionCookie, MAX_SESSION_TOKEN_BYTES } from "@/dashboard/server/session";
import { verifyDashboardToken } from "@/server/integration/dashboard-session";
import { dispatchInternal } from "@/server/integration/dispatch";
import { csrfFailure, isSameOriginMutation, noStoreJson, UPSTREAM_TIMEOUT_MS, upstreamFailure } from "@/dashboard/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return csrfFailure();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    // Small credentials JSON only; large bodies are rejected before parsing.
    const reader = request.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 16_384) { await reader.cancel(); return noStoreJson({ message: "حجم الطلب أكبر من الحد المسموح" }, 413); }
        chunks.push(value);
      }
    }
    let credentials: unknown;
    try { credentials = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { return noStoreJson({ message: "بيانات الدخول غير صالحة" }, 400); }
    if (!credentials || typeof credentials !== "object" || !("email" in credentials) || !("password" in credentials) || typeof credentials.email !== "string" || typeof credentials.password !== "string") return noStoreJson({ message: "بيانات الدخول غير صالحة" }, 400);
    const upstream = await dispatchInternal(new Request("https://internal.lapis.invalid/api/auth/login", {
      method: "POST", redirect: "manual", cache: "no-store", signal: controller.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": "ar" },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    }));
    const payload = await upstream.json() as { message?: string; error?: string | { message?: string }; data?: { id?: string; email?: string; role?: string | number; token?: string; expiresOn?: string } };
    if (!upstream.ok) {
      const message = payload.message || (typeof payload.error === "string" ? payload.error : payload.error?.message) || "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      const response = noStoreJson({ message }, upstream.status >= 400 ? upstream.status : 502);
      if (upstream.status === 401) clearSessionCookie(response);
      return response;
    }
    const data = payload.data;
    if (data?.token && Buffer.byteLength(data.token) > MAX_SESSION_TOKEN_BYTES) return noStoreJson({ message: "حجم الجلسة يتطلب إعداد مخزن جلسات على الخادم" }, 502);
    const session = (await verifyDashboardToken(data?.token))?.session;
    const expiresAt = expiryTime(data?.expiresOn ?? null);
    if (!data || !isAdminRole(data.role) || !session || expiresAt <= Date.now() || session.user.id !== data.id || session.user.email !== data.email) {
      const response = noStoreJson({ message: "ليس لديك صلاحية الدخول إلى لوحة التحكم" }, 403);
      clearSessionCookie(response);
      return response;
    }
    const expiresOn = new Date(Math.min(expiresAt, expiryTime(session.expiresOn))).toISOString();
    const response = noStoreJson({ user: session.user, expiresOn });
    setSessionCookie(response, data.token!, expiresOn);
    return response;
  } catch (error) { return upstreamFailure(error, controller.signal.aborted); }
  finally { clearTimeout(timer); }
}
