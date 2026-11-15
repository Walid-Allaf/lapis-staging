import { readAdminSession, clearSessionCookie } from "@/dashboard/server/session";
import { noStoreJson } from "@/dashboard/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await readAdminSession();
    if (auth) return noStoreJson(auth.session);
  } catch { return noStoreJson({ message: "خدمة الجلسة غير متاحة مؤقتًا" }, 503); }
  const response = noStoreJson({ message: "يرجى تسجيل الدخول" }, 401);
  clearSessionCookie(response);
  return response;
}
