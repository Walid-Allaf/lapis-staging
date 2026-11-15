import type { Metadata } from "next";
import { FAQSection } from "@/components/faq-section";
import { YouTubeVideosPageHeroSection } from "@/components/youtube-videos-page-hero-section";
import { getFAQs } from "@/lib/api/faqs";
import { getSettings } from "@/lib/api/settings";
import { getYouTubeGalleries } from "@/lib/api/youtube-galleries";
import { resources } from "@/lib/i18n/resources";
import { createPageMetadata } from "@/lib/seo";
import { youtubeVideosKeywords } from "@/lib/seo-keywords";
import { isSectionVisible } from "@/lib/section-visibility";

const englishSeo = resources.en.common.youtubeVideosPage;
const arabicSeo = resources.ar.common.youtubeVideosPage;

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: englishSeo,
    ar: arabicSeo,
    path: "/youtube-videos",
    keywords: youtubeVideosKeywords,
  });
}

export default async function YouTubeVideosPage() {
  const [settingsResponse, videosResponse, faqsResponse] = await Promise.all([
    getSettings().catch(() => ({
      data: null,
    })),
    getYouTubeGalleries().catch(() => ({
      data: [],
    })),
    getFAQs().catch(() => ({
      data: [],
    })),
  ]);
  const settings = settingsResponse.data;

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {isSectionVisible(settings, "youTubeGalleriesTabToggle") ? (
        <YouTubeVideosPageHeroSection videos={videosResponse.data} />
      ) : null}
      {isSectionVisible(settings, "faQsTabToggle") ? (
        <FAQSection faqs={faqsResponse.data} />
      ) : null}
    </main>
  );
}
