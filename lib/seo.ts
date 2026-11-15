import type { Metadata } from "next";
import { cookies } from "next/headers";
import { fallbackLng, isLanguage, type Language } from "@/lib/i18n/settings";
import {
  createAbsoluteUrl,
  formatSeoTitle,
  languageCookieKey,
  seoBrandNames,
  seoSiteDescriptions,
  siteUrl,
} from "@/lib/seo-shared";

type SeoContent = {
  seoDescription: string;
  seoTitle: string;
};

type PageMetadataInput = {
  absoluteTitle?: boolean;
  ar: SeoContent;
  en: SeoContent;
  keywords?: string[];
  path: string;
};

export async function getSeoLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const storedLanguage = cookieStore.get(languageCookieKey)?.value;

  return isLanguage(storedLanguage) ? storedLanguage : fallbackLng;
}

export async function createRootMetadata(): Promise<Metadata> {
  const language = await getSeoLanguage();
  const brandName = seoBrandNames[language];
  const description = seoSiteDescriptions[language];
  const rootUrl = createAbsoluteUrl("/");
  const openGraphImage = createAbsoluteUrl("/opengraph-image.png");
  const twitterImage = createAbsoluteUrl("/twitter-image.png");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: brandName,
      template: `%s | ${brandName}`,
    },
    description,
    applicationName: brandName,
    alternates: {
      canonical: rootUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: brandName,
      description,
      siteName: brandName,
      type: "website",
      url: rootUrl,
      locale: language === "ar" ? "ar_AR" : "en_US",
      alternateLocale: [language === "ar" ? "en_US" : "ar_AR"],
      images: [
        {
          url: openGraphImage,
          width: 1200,
          height: 630,
          alt: brandName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: brandName,
      description,
      images: {
        url: twitterImage,
        alt: brandName,
      },
    },
  };
}

export async function createPageMetadata({
  absoluteTitle = false,
  ar,
  en,
  keywords,
  path,
}: PageMetadataInput): Promise<Metadata> {
  const language = await getSeoLanguage();
  const localizedSeo = language === "ar" ? ar : en;
  const alternateSeo = language === "ar" ? en : ar;
  const formattedTitle = absoluteTitle
    ? localizedSeo.seoTitle
    : formatSeoTitle(localizedSeo.seoTitle, language);
  const alternateLanguage = language === "ar" ? "en" : "ar";
  const alternateTitle = absoluteTitle
    ? alternateSeo.seoTitle
    : formatSeoTitle(alternateSeo.seoTitle, alternateLanguage);
  const canonicalUrl = createAbsoluteUrl(path);
  const openGraphImage = createAbsoluteUrl("/opengraph-image.png");
  const twitterImage = createAbsoluteUrl("/twitter-image.png");
  const brandName = seoBrandNames[language];

  return {
    title: absoluteTitle
      ? { absolute: localizedSeo.seoTitle }
      : localizedSeo.seoTitle,
    description: localizedSeo.seoDescription,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: formattedTitle,
      description: localizedSeo.seoDescription,
      type: "website",
      url: canonicalUrl,
      siteName: brandName,
      locale: language === "ar" ? "ar_AR" : "en_US",
      alternateLocale: [language === "ar" ? "en_US" : "ar_AR"],
      images: [
        {
          url: openGraphImage,
          width: 1200,
          height: 630,
          alt: formattedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: formattedTitle,
      description: localizedSeo.seoDescription,
      images: {
        url: twitterImage,
        alt: formattedTitle,
      },
    },
    other: {
      [`title:${language}`]: formattedTitle,
      [`description:${language}`]: localizedSeo.seoDescription,
      [`title:${alternateLanguage}`]: alternateTitle,
      [`description:${alternateLanguage}`]: alternateSeo.seoDescription,
    },
  };
}
