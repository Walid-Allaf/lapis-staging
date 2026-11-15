import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import { apiFetch } from "./client";

export type SiteSettings = {
  phoneNumber: string;
  email: string;
  address: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  faQsTabToggle?: boolean;
  servicesTabToggle?: boolean;
  galleriesTabToggle?: boolean;
  youTubeGalleriesTabToggle?: boolean;
  testimonialsTabToggle?: boolean;
  ourSpecialistsTabToggle?: boolean;
  aboutUs_Ar: string;
  aboutUs_En: string;
  contactUs_Ar: string;
  contactUs_En: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
};

export async function getSettings() {
  const options = {
    next: {
      revalidate: 60,
      tags: [PUBLIC_CACHE_TAGS.settings],
    },
  };

  try {
    return await apiFetch<SiteSettings>("/api/Client/get-settings", options);
  } catch {
    return apiFetch<SiteSettings>("/api/Setting/get", options);
  }
}
