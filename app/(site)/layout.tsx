import React from "react";
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { AOSInitializer } from "@/components/aos-initializer";
import { SeoLanguageSync } from "@/components/seo-language-sync";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings } from "@/lib/api/settings";
import { I18nProvider } from "@/lib/i18n/client";
import { getDirection } from "@/lib/i18n/settings";
import { createRootMetadata, getSeoLanguage } from "@/lib/seo";
import {
  createAbsoluteUrl,
  seoSiteDescriptions,
} from "@/lib/seo-shared";
import "aos/dist/aos.css";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
});

function parseCoordinate(value: number | string | null | undefined) {
  const coordinate = Number(value);

  return Number.isFinite(coordinate) ? coordinate : undefined;
}

function normalizePhoneNumber(value: string | null | undefined) {
  const phoneNumber = value?.trim();

  if (!phoneNumber) {
    return undefined;
  }

  return /^\d+$/.test(phoneNumber) ? `+${phoneNumber}` : phoneNumber;
}

function isPublicSocialUrl(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    const pathname = url.pathname.toLowerCase().replace(/\/$/, "");

    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      pathname !== "/example" &&
      pathname !== "/@example"
    );
  } catch {
    return false;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return createRootMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsResponse = await getSettings().catch(() => ({
    data: null,
  }));
  const language = await getSeoLanguage();
  const settings = settingsResponse.data;
  const latitude = parseCoordinate(settings?.latitude);
  const longitude = parseCoordinate(settings?.longitude);
  const phoneNumber = normalizePhoneNumber(settings?.phoneNumber);
  const organizationId = createAbsoluteUrl("/#organization");
  const cityName = language === "ar" ? "حلب" : "Aleppo";
  const districtName = language === "ar" ? "الجميلية" : "Al-Jamiliah";
  const mapUrl =
    latitude !== undefined && longitude !== undefined
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : undefined;
  const sameAs = [
    settings?.facebookUrl,
    settings?.instagramUrl,
    settings?.twitterUrl,
    settings?.youtubeUrl,
    settings?.tiktokUrl,
  ].filter(isPublicSocialUrl);
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService", "Organization"],
    "@id": organizationId,
    name: "LAPiS Dental Lab",
    alternateName: ["Lapis Dental Lab", "لابيس لمخبر الأسنان"],
    url: createAbsoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      "@id": createAbsoluteUrl("/#logo"),
      url: createAbsoluteUrl("/brand/logo-dark.png"),
      contentUrl: createAbsoluteUrl("/brand/logo-dark.png"),
      caption: "LAPiS Dental Lab",
    },
    image: {
      "@type": "ImageObject",
      url: createAbsoluteUrl("/opengraph-image.png"),
      width: 1200,
      height: 630,
    },
    description: seoSiteDescriptions[language],
    telephone: phoneNumber,
    email: settings?.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: districtName,
      addressLocality: cityName,
      addressRegion: cityName,
      addressCountry: "SY",
    },
    geo:
      latitude !== undefined && longitude !== undefined
        ? {
            "@type": "GeoCoordinates",
            latitude,
            longitude,
          }
        : undefined,
    hasMap: mapUrl,
    areaServed: {
      "@type": "City",
      name: cityName,
    },
    contactPoint:
      phoneNumber || settings?.email
        ? {
            "@type": "ContactPoint",
            telephone: phoneNumber,
            email: settings?.email || undefined,
            contactType: "customer service",
            availableLanguage: ["Arabic", "English"],
            areaServed: "SY",
          }
        : undefined,
    knowsLanguage: ["ar", "en"],
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  return (
    <html
      lang={language}
      dir={getDirection(language)}
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <I18nProvider>
          <AOSInitializer />
          <SeoLanguageSync />
          <NextTopLoader color="#d7b56d" height={3} showSpinner={false} speed={300} />
          <SiteHeader settings={settings} />
          {children}
          <SiteFooter settings={settings} />
        </I18nProvider>
      </body>
    </html>
  );
}
