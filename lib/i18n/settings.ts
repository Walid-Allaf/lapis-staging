export const fallbackLng = "ar";
export const languages = ["en", "ar"] as const;
export const defaultNS = "common";

export type Language = (typeof languages)[number];

export function isLanguage(value: string | null | undefined): value is Language {
  return languages.includes(value as Language);
}

export function getDirection(language: string) {
  return language === "ar" ? "rtl" : "ltr";
}
