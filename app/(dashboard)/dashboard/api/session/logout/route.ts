import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie } from "@/dashboard/server/session";
import { csrfFailure, isSameOriginMutation } from "@/dashboard/server/http";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/dashboard/api/session-contract";
import { revokeDashboardToken } from "@/server/integration/dashboard-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return csrfFailure();
  const response = new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  clearSessionCookie(response);
  try { await revokeDashboardToken((await cookies()).get(SESSION_COOKIE_NAME)?.value); }
  catch {
    const failure = NextResponse.json({ message: "تعذر تأكيد إبطال الجلسة، يرجى المحاولة لاحقًا" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    clearSessionCookie(failure); return failure;
  }
  return response;
}
