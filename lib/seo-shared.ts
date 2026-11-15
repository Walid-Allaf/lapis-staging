import type { Language } from "@/lib/i18n/settings";

export const languageCookieKey = "lapis.language";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://lapisdent.com"
).replace(/\/$/, "");

export const seoBrandNames: Record<Language, string> = {
  en: "LAPiS Dental Lab",
  ar: "لابيس لمختبر الأسنان",
};

export const seoSiteDescriptions: Record<Language, string> = {
  en: "LAPiS Dental Lab in Aleppo, Syria, provides dentists and clinics with precise dental restorations and dependable digital laboratory support.",
  ar: "مخبر لابيس للأسنان في حلب، سوريا، يقدم لأطباء وعيادات الأسنان ترميمات سنية دقيقة ودعما مخبريا رقميا موثوقا.",
};

export function createAbsoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}

export function formatSeoTitle(title: string, language: Language) {
  return `${title} | ${seoBrandNames[language]}`;
}
