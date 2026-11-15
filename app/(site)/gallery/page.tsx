import type { Metadata } from "next";
import { FAQSection } from "@/components/faq-section";
import { GalleryPageHeroSection } from "@/components/gallery-page-hero-section";
import { getFAQs } from "@/lib/api/faqs";
import { getGalleries } from "@/lib/api/galleries";
import { getSettings } from "@/lib/api/settings";
import { resources } from "@/lib/i18n/resources";
import { createPageMetadata } from "@/lib/seo";
import { galleryKeywords } from "@/lib/seo-keywords";
import { isSectionVisible } from "@/lib/section-visibility";

const englishSeo = resources.en.common.galleryPage;
const arabicSeo = resources.ar.common.galleryPage;

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: englishSeo,
    ar: arabicSeo,
    path: "/gallery",
    keywords: galleryKeywords,
  });
}

export default async function GalleryPage() {
  const [settingsResponse, galleriesResponse, faqsResponse] = await Promise.all([
    getSettings().catch(() => ({
      data: null,
    })),
    getGalleries().catch(() => ({
      data: [],
    })),
    getFAQs().catch(() => ({
      data: [],
    })),
  ]);
  const settings = settingsResponse.data;

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {isSectionVisible(settings, "galleriesTabToggle") ? (
        <GalleryPageHeroSection galleries={galleriesResponse.data} />
      ) : null}
      {isSectionVisible(settings, "faQsTabToggle") ? (
        <FAQSection faqs={faqsResponse.data} />
      ) : null}
    </main>
  );
}
