import "server-only";
import { createResourceHandler, createSingletonHandler } from "../backend/http/content-handler";

// Public RSC acquisition does not import uploads, SMTP, user administration or arbitrary route modules.
export async function dispatchPublic(request: Request): Promise<Response> {
  if (request.method !== "GET") return new Response(null, { status: 405 });
  const pathname = new URL(request.url).pathname;
  if (pathname === "/api/Client/get-settings") return createSingletonHandler("settings-public")(request);
  if (pathname === "/api/Client/get-ads") return createSingletonHandler("ads-public")(request);
  // Preserve the existing getSettings fallback, including its anonymous401; never elevate it to public access/cache.
  if (pathname === "/api/Setting/get") return createSingletonHandler("settings-get")(request);
  for (const name of ["Services", "FAQs", "OurSpecialists", "Testimonials", "Galleries", "YouTubeGalleries", "BlogPosts"] as const) {
    if (pathname === `/api/${name}/get-all`) return createResourceHandler(name, "list")(request);
    const match = new RegExp(`^/api/${name}/get-by-id/([^/]+)$`).exec(pathname);
    if (match) return createResourceHandler(name, "detail")(request, decodeURIComponent(match[1]));
  }
  const slug = /^\/api\/BlogPosts\/by-slug\/([^/]+)$/.exec(pathname);
  if (slug) return createResourceHandler("BlogPosts", "slug")(request, decodeURIComponent(slug[1]));
  return Response.json({ message: "Public operation is not allowed." }, { status: 403 });
}
