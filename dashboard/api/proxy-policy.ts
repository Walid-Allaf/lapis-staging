import { servicesEndpoints } from "@/dashboard/features/services/services/services-endpoints";
import { faqsEndpoints } from "@/dashboard/features/faqs/services/faqs-endpoints";
import { ourSpecialistsEndpoints } from "@/dashboard/features/our-specialists/services/our-specialists-endpoints";
import { testimonialsEndpoints } from "@/dashboard/features/testimonials/services/testimonials-endpoints";
import { galleryEndpoints } from "@/dashboard/features/gallery/services/gallery-endpoints";
import { youtubeGalleriesEndpoints } from "@/dashboard/features/youtube-galleries/services/youtube-galleries-endpoints";
import { blogPostsEndpoints } from "@/dashboard/features/blog-posts/services/blog-posts-endpoints";
import { SettingEndpoints } from "@/dashboard/features/setting/services/setting-endpoints";
import { PUBLIC_CACHE_TAGS as tags } from "@/lib/public-cache-tags";

type CrudEndpoints = { getAll: string; getById: (id: number) => string; add: string; update: (id: number) => string; remove: (id: number) => string };
type Rule = { method: string; path: string; tags: readonly string[] };

function crud(endpoints: CrudEndpoints, tag: string, relatedTags: string[] = []): Rule[] {
  const idPath = (fn: (id: number) => string) => fn(0).replace(/\/0$/, "/:id");
  return [
    { method: "GET", path: endpoints.getAll, tags: [] },
    { method: "GET", path: idPath(endpoints.getById), tags: [] },
    { method: "POST", path: endpoints.add, tags: [tag, ...relatedTags] },
    { method: "PUT", path: idPath(endpoints.update), tags: [tag, ...relatedTags] },
    { method: "DELETE", path: idPath(endpoints.remove), tags: [tag, ...relatedTags] },
  ];
}

// Endpoint strings come from the feature constants, not from a second handler list.
export const PROXY_RULES: readonly Rule[] = [
  ...crud(servicesEndpoints, tags.services), ...crud(faqsEndpoints, tags.faqs), ...crud(ourSpecialistsEndpoints, tags.specialists, [tags.blog]),
  ...crud(testimonialsEndpoints, tags.testimonials), ...crud(galleryEndpoints, tags.gallery), ...crud(youtubeGalleriesEndpoints, tags.youtube), ...crud(blogPostsEndpoints, tags.blog),
  { method: "GET", path: blogPostsEndpoints.getBySlug(":slug"), tags: [] },
  { method: "GET", path: SettingEndpoints.get, tags: [] },
  { method: "PUT", path: SettingEndpoints.update, tags: [tags.settings] },
  { method: "POST", path: "FileUpload/upload", tags: [] },
];

export function matchProxyRule(method: string, segments: string[]) {
  return PROXY_RULES.find(rule => rule.method === method && rule.path.split("/").length === segments.length &&
    rule.path.split("/").every((part, index) => part === ":id" ? /^\d+$/.test(segments[index]) : part === ":slug" ? Boolean(segments[index]) : part === segments[index]));
}

export function buildUpstreamUrl(base: string, segments: string[], search: string): URL {
  if (!segments.length || segments.some(segment => !segment || segment === "." || segment === ".." || /[%/\\?#:@\s\u0000-\u001f\u007f-\u009f]/u.test(segment))) {
    throw new Error("Invalid proxy path");
  }
  const backend = new URL(base);
  const url = new URL(`${base.replace(/\/+$/, "")}/api/${segments.join("/")}`);
  if (!["http:", "https:"].includes(backend.protocol) || backend.username || backend.password || url.origin !== backend.origin || !url.pathname.startsWith("/api/")) {
    throw new Error("Invalid upstream URL");
  }
  url.search = search;
  return url;
}
