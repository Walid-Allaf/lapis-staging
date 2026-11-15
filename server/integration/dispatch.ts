import "server-only";
import { createResourceHandler, createSingletonHandler, type ResourceAction, type SingletonAction } from "../backend/http/content-handler";
import { createAuthHandler, createUserHandler } from "../backend/http/auth-handler";
import { createUploadHandler } from "../backend/http/file-handler";

type Entry = { method: string; path: string; run: (request: Request, parameter?: string) => Promise<Response> };
const registry: Entry[] = [];
for (const name of ["Services", "FAQs", "OurSpecialists", "Testimonials", "Galleries", "YouTubeGalleries", "BlogPosts"] as const) {
  for (const [method, path, action] of [["POST", "add", "create"], ["GET", "get-all", "list"], ["GET", "get-by-id/{id}", "detail"], ["PUT", "edit/{id}", "update"], ["DELETE", "delete/{id}", "delete"]] as const) {
    registry.push({ method, path: `/api/${name}/${path}`, run: createResourceHandler(name, action as ResourceAction) });
  }
}
registry.push({ method: "GET", path: "/api/BlogPosts/by-slug/{slug}", run: createResourceHandler("BlogPosts", "slug") });
for (const [method, path, action] of [
  ["GET", "/api/Client/get-settings", "settings-public"], ["GET", "/api/Client/get-ads", "ads-public"],
  ["GET", "/api/Setting/get", "settings-get"], ["PUT", "/api/Setting/edit", "settings-edit"], ["GET", "/api/Setting/get-statistic", "statistics"],
  ["GET", "/api/Ads/get", "ads-get"], ["PUT", "/api/Ads/edit", "ads-edit"],
] as const) registry.push({ method, path, run: createSingletonHandler(action as SingletonAction) });
for (const operation of ["register", "login", "confirm-email", "reset-password", "send-otp", "verify-otp", "toggle-2fa"] as const) registry.push({ method: "POST", path: "/api/auth/" + operation, run: createAuthHandler(operation) });
for (const [method, operation] of [["GET", "get-info"], ["GET", "get-all"], ["GET", "get-by-id"], ["PUT", "edit-profile"], ["POST", "change-password"], ["POST", "toggle-disable"]] as const) registry.push({ method, path: "/api/User/" + operation + (operation === "get-by-id" ? "/{id}" : ""), run: createUserHandler(operation) });
registry.push({ method: "POST", path: "/api/FileUpload/upload", run: createUploadHandler() });
export const INTERNAL_OPERATIONS = registry.map(({ method, path }) => ({ method, path }));

export async function dispatchInternal(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  for (const entry of registry) {
    const regex = new RegExp("^" + entry.path.replace(/\{[^}]+\}/g, "([^/]+)") + "$"), match = regex.exec(pathname);
    if (!match) continue;
    if (request.method !== entry.method) return Response.json({ message: "Method not allowed." }, { status: 405, headers: { Allow: entry.method, "Cache-Control": "no-store" } });
    let parameter: string | undefined;
    try { parameter = match[1] === undefined ? undefined : decodeURIComponent(match[1]); }
    catch { return Response.json({ message: "Invalid path." }, { status: 400 }); }
    return entry.run(request, parameter);
  }
  return Response.json({ message: "Not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
}
