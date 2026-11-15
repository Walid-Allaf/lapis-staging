import { NextResponse, NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { buildUpstreamUrl, matchProxyRule } from "@/dashboard/api/proxy-policy";
import { dispatchInternal } from "@/server/integration/dispatch";
import { boundedRequestBody, BodyLimitError } from "@/dashboard/server/body-limit";
import { readAdminSession, clearSessionCookie } from "@/dashboard/server/session";
import { csrfFailure, isSameOriginMutation, noStoreJson, UPSTREAM_TIMEOUT_MS, upstreamFailure } from "@/dashboard/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!isSameOriginMutation(request)) return csrfFailure();
  const { path } = await context.params;
  let url: URL;
  try { url = buildUpstreamUrl("https://internal.lapis.invalid", path, request.nextUrl.search); }
  catch { return noStoreJson({ message: "مسار الطلب غير صالح" }, 400); }
  const rule = matchProxyRule(request.method, path);
  if (!rule) return noStoreJson({ message: "هذا الطلب غير مسموح" }, 403);
  let auth;
  try { auth = await readAdminSession(); }
  catch { return noStoreJson({ message: "خدمة الجلسة غير متاحة مؤقتًا" }, 503); }
  if (!auth) {
    const response = noStoreJson({ message: "يرجى تسجيل الدخول" }, 401);
    clearSessionCookie(response);
    return response;
  }
  const headers = new Headers();
  const hopHeaders = new Set((request.headers.get("connection") ?? "").toLowerCase().split(",").map(name => name.trim()));
  for (const name of ["Content-Type", "Accept", "Accept-Language", "timezone"]) {
    const value = request.headers.get(name);
    if (value && !hopHeaders.has(name.toLowerCase())) headers.set(name, value);
  }
  headers.set("Authorization", `Bearer ${auth.token}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  let limited: ReturnType<typeof boundedRequestBody> | undefined;
  try {
    if (request.method !== "GET" && request.method !== "HEAD") limited = boundedRequestBody(request);
    const options: RequestInit & { duplex?: "half" } = {
      method: request.method, headers, cache: "no-store", redirect: "manual", signal: controller.signal,
      ...(limited?.body ? { body: limited.body, duplex: "half" } : {}),
    };
    const upstream = await dispatchInternal(new NextRequest(url, { ...options, signal: controller.signal }));
    if (controller.signal.aborted) return upstreamFailure(new Error("Request timed out"), true);
    const bodyFailure = limited?.getFailure();
    if (bodyFailure) return noStoreJson({ message: bodyFailure.message }, bodyFailure.status);
    // Buffer API responses (not upload requests) so a response-body timeout can
    // still produce a complete 504 instead of a partially sent 200 response.
    const body = await upstream.arrayBuffer();
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    const contentType = upstream.headers.get("content-type");
    const responseHopHeaders = (upstream.headers.get("connection") ?? "").toLowerCase().split(",").map(name => name.trim());
    // These endpoints return JSON. Never serve an upstream HTML error document
    // as executable markup on the dashboard's own origin.
    responseHeaders.set("Content-Type", contentType && /^(?:application|text)\/(?:[\w.-]+\+)?json(?:;|$)/i.test(contentType) && !responseHopHeaders.includes("content-type") ? contentType : "text/plain; charset=utf-8");
    const response = new NextResponse([204, 205, 304].includes(upstream.status) ? null : body, { status: upstream.status, headers: responseHeaders });
    if (upstream.status === 401) clearSessionCookie(response);
    if (upstream.ok && request.method !== "GET") {
      // A Route Handler cannot call updateTag. expire: 0 makes the next public
      // fetch wait for fresh data instead of serving stale-while-revalidate.
      for (const tag of rule.tags) revalidateTag(tag, { expire: 0 });
    }
    return response;
  } catch (error) {
    const failure = limited?.getFailure() ?? (error instanceof BodyLimitError ? error : null);
    if (failure) return noStoreJson({ message: failure.message }, failure.status);
    return upstreamFailure(error, controller.signal.aborted);
  } finally { clearTimeout(timer); }
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
