import type { Metadata } from "next";
import { AboutPageHeroSection } from "@/components/about-page-hero-section";
import { IntroVideoSection } from "@/components/intro-video-section";
import { ServicesSection } from "@/components/services-section";
import { getServices } from "@/lib/api/services";
import { getSettings } from "@/lib/api/settings";
import { resources } from "@/lib/i18n/resources";
import { createPageMetadata } from "@/lib/seo";
import { aboutKeywords } from "@/lib/seo-keywords";
import { isSectionVisible } from "@/lib/section-visibility";

const englishSeo = resources.en.common.aboutPage;
const arabicSeo = resources.ar.common.aboutPage;

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: englishSeo,
    ar: arabicSeo,
    path: "/about",
    keywords: aboutKeywords,
  });
}

export default async function AboutPage() {
  const [settingsResponse, servicesResponse] = await Promise.all([
    getSettings().catch(() => ({
      data: null,
    })),
    getServices({ pageSize: 3 }).catch(() => ({
      data: [],
    })),
  ]);
  const settings = settingsResponse.data;

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <AboutPageHeroSection />
      {isSectionVisible(settings, "servicesTabToggle") ? (
        <ServicesSection services={servicesResponse.data} />
      ) : null}
      <IntroVideoSection />
    </main>
  );
}
