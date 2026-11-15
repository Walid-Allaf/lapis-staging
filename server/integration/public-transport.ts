import "server-only";
import { createHash } from "node:crypto";
import { STATUS_CODES } from "node:http";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";
import { dispatchPublic } from "./public-dispatch";

type Options = Omit<RequestInit, "body"> & { query?: Record<string, string | number | boolean | null | undefined>; next?: NextFetchRequestConfig };
export async function publicApiResponse(path: string, options: Options): Promise<Response> {
  // Never query SQL or recursively fetch a self-hosted origin while prerendering.
  await connection();
  if (!/^\/api\/(?:Services|FAQs|OurSpecialists|Testimonials|Galleries|YouTubeGalleries|BlogPosts)\/(?:get-all|get-by-id\/[^/]+|by-slug\/[^/]+)$/.test(path) && !["/api/Client/get-settings", "/api/Client/get-ads", "/api/Setting/get"].includes(path)) {
    return Response.json({ message: "Public operation is not allowed." }, { status: 403 });
  }
  const url = new URL(path, "https://internal.lapis.invalid");
  for (const [key, value] of Object.entries(options.query ?? {})) if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  const headers = new Headers(options.headers); headers.set("Accept", "application/json");
  const method = options.method ?? "GET";
  if (method !== "GET") return Response.json({ message: "Method not allowed." }, { status: 405 });
  if (options.signal?.aborted) throw new Error("API request aborted.");
  const read = async () => {
    const response = await dispatchPublic(new Request(url, { method, headers, signal: options.signal }));
    if (!response.ok) {
      const operation = url.pathname.replace(/\/(?:by-slug|get-by-id)\/[^/]+$/, "/lookup/{value}");
      console.error(JSON.stringify({ event: "public_backend_error", operation, status: response.status }));
      return { status: response.status, statusText: STATUS_CODES[response.status] ?? "", body: await response.text() };
    }
    return { status: 200, statusText: "OK", body: await response.text() };
  };
  // No private headers or identity enter the persistent shared cache.
  const privateRead = headers.has("authorization") || headers.has("cookie") || path === "/api/Setting/get";
  const ttl = options.next?.revalidate;
  let result;
  if (privateRead || options.cache === "no-store" || ttl === 0 || options.signal) result = await read();
  else {
    const namespace = createHash("sha256").update([process.env.SQL_SERVER, process.env.SQL_PORT, process.env.SQL_DATABASE, process.env.APP_ORIGIN].join("|")).digest("hex");
    result = await unstable_cache(async () => {
      const value = await read();
      if (value.status !== 200) throw new PublicReadError(value);
      return value;
    }, ["lapis-internal-public-v1", namespace, url.pathname + url.search, headers.get("accept-language") ?? ""],
    { revalidate: ttl === undefined ? 60 : ttl, tags: options.next?.tags ?? [] })().catch(error => {
      if (error instanceof PublicReadError) return error.result;
      throw error;
    });
  }
  return new Response(result.body, { status: result.status, statusText: result.statusText, headers: { "Content-Type": "application/json" } });
}
class PublicReadError extends Error {
  constructor(readonly result: { status: number; statusText: string; body: string }) { super("Public data unavailable."); }
}
