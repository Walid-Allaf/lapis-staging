import type { SiteSettings } from "@/lib/api/settings";
import {
  isSectionVisible,
  type SectionVisibilityKey,
} from "@/lib/section-visibility";

type NavItem = {
  link: string;
  name: string;
  visibilityKey?: SectionVisibilityKey;
};

export const navItems: readonly NavItem[] = [
  { name: "nav.home", link: "/" },
  { name: "nav.services", link: "/services", visibilityKey: "servicesTabToggle" },
  { name: "nav.gallery", link: "/gallery", visibilityKey: "galleriesTabToggle" },
  {
    name: "nav.youtubeVideos",
    link: "/youtube-videos",
    visibilityKey: "youTubeGalleriesTabToggle",
  },
  { name: "nav.blogs", link: "/blog" },
  { name: "nav.about", link: "/about" },
  { name: "nav.contact", link: "/contact" },
] as const;

export function getVisibleNavItems(settings: SiteSettings | null) {
  return navItems.filter((item) => {
    if (!item.visibilityKey) {
      return true;
    }

    return isSectionVisible(settings, item.visibilityKey);
  });
}
