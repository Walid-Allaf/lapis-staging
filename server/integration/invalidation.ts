import "server-only";
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS as tags } from "../../lib/public-cache-tags";

export function contentTags(resource: string): readonly string[] {
  const map: Record<string, readonly string[]> = { Services: [tags.services], FAQs: [tags.faqs], OurSpecialists: [tags.specialists, tags.blog],
    Testimonials: [tags.testimonials], Galleries: [tags.gallery], YouTubeGalleries: [tags.youtube], BlogPosts: [tags.blog], Setting: [tags.settings], Ads: [] };
  return map[resource] ?? [];
}
export function invalidateContent(request: Request, resource: string): void {
  // Next supplies NextRequest in real Route Handlers. Plain Request unit/CLI service calls have no Next cache context.
  // This distinction only controls cache notification; SQL-backed authorization never depends on it.
  // Next may supply the class from a separately bundled runtime realm; use its documented nextUrl interface too.
  if (!(request instanceof NextRequest) && !("nextUrl" in request)) return;
  for (const tag of contentTags(resource)) revalidateTag(tag, { expire: 0 });
}
