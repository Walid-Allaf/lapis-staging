"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { fallbackLng, isLanguage } from "@/lib/i18n/settings";
import { useTranslation } from "@/lib/i18n/client";
import { formatSeoTitle } from "@/lib/seo-shared";

const routeSeoKeys: Record<
  string,
  { absoluteTitle?: boolean; description: string; title: string }
> = {
  "/": {
    absoluteTitle: true,
    title: "homePage.seoTitle",
    description: "homePage.seoDescription",
  },
  "/services": {
    title: "servicesPage.seoTitle",
    description: "servicesPage.seoDescription",
  },
  "/about": {
    title: "aboutPage.seoTitle",
    description: "aboutPage.seoDescription",
  },
  "/contact": {
    title: "contactPage.seoTitle",
    description: "contactPage.seoDescription",
  },
  "/gallery": {
    title: "galleryPage.seoTitle",
    description: "galleryPage.seoDescription",
  },
  "/youtube-videos": {
    title: "youtubeVideosPage.seoTitle",
    description: "youtubeVideosPage.seoDescription",
  },
  "/blog": {
    title: "blogPage.seoTitle",
    description: "blogPage.seoDescription",
  },
};

export function SeoLanguageSync() {
  const pathname = usePathname();
  const { language, t } = useTranslation();

  useEffect(() => {
    const routeSeo = routeSeoKeys[pathname || "/"];
    const seoLanguage = isLanguage(language) ? language : fallbackLng;

    if (!routeSeo) {
      return;
    }

    document.title = routeSeo.absoluteTitle
      ? t(routeSeo.title)
      : formatSeoTitle(t(routeSeo.title), seoLanguage);

    const description = t(routeSeo.description);
    let metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }

    metaDescription.content = description;
  }, [language, pathname, t]);

  return null;
}
