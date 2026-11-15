import "server-only";
import { NextResponse } from "next/server";
import { applicationOrigin } from "@/server/integration/origin";

export const UPSTREAM_TIMEOUT_MS = 30_000;

export function noStoreJson(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

export function isSameOriginMutation(request: Request): boolean {
  if (request.method === "GET" || request.method === "HEAD") return true;
  const suppliedOrigin = request.headers.get("origin");
  const source = suppliedOrigin ?? request.headers.get("referer");
  if (!source || suppliedOrigin === "null") return false;
  try {
    // Next normalizes loopback hosts, and IIS may use an internal listener URL.
    // A configured, validated origin is trusted; forwarded/client Host headers never expand it.
    const expected = process.env.APP_ORIGIN ? applicationOrigin() : new URL(request.url);
    const actual = new URL(source);
    // Do not use client-supplied forwarded headers to expand the trusted origin.
    return !actual.username && !actual.password && actual.origin === expected.origin && (!suppliedOrigin || (actual.pathname === "/" && !actual.search && !actual.hash));
  } catch { return false; }
}

export function csrfFailure() { return noStoreJson({ message: "مصدر الطلب غير مسموح" }, 403); }

export function upstreamFailure(error: unknown, timedOut: boolean) {
  if (timedOut || (error instanceof Error && error.name === "TimeoutError")) return noStoreJson({ message: "تم تجاوز مهلة الخادم" }, 504);
  return noStoreJson({ message: "تعذر الاتصال بالخادم" }, 502);
}
