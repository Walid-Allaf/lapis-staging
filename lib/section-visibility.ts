import type { SiteSettings } from "@/lib/api/settings";

export type SectionVisibilityKey =
  | "faQsTabToggle"
  | "galleriesTabToggle"
  | "ourSpecialistsTabToggle"
  | "servicesTabToggle"
  | "testimonialsTabToggle"
  | "youTubeGalleriesTabToggle";

export function isSectionVisible(
  settings: SiteSettings | null,
  key: SectionVisibilityKey,
) {
  return settings?.[key] !== false;
}
