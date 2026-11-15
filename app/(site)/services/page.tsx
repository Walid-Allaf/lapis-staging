import type { Metadata } from "next";
import { DentalWebsiteCTASection } from "@/components/dental-website-cta-section";
import { FAQSection } from "@/components/faq-section";
import { IntroVideoSection } from "@/components/intro-video-section";
import { ServicesPageHeroSection } from "@/components/services-page-hero-section";
import { SpecialistsSection } from "@/components/specialists-section";
import { getFAQs } from "@/lib/api/faqs";
import { getAllServices } from "@/lib/api/services";
import { getSettings } from "@/lib/api/settings";
import { getSpecialists } from "@/lib/api/specialists";
import { resources } from "@/lib/i18n/resources";
import { createPageMetadata } from "@/lib/seo";
import { servicesKeywords } from "@/lib/seo-keywords";
import { isSectionVisible } from "@/lib/section-visibility";

const englishSeo = resources.en.common.servicesPage;
const arabicSeo = resources.ar.common.servicesPage;

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: englishSeo,
    ar: arabicSeo,
    path: "/services",
    keywords: servicesKeywords,
  });
}

export default async function ServicesPage() {
  const [settingsResponse, servicesResponse, specialistsResponse, faqsResponse] =
    await Promise.all([
      getSettings().catch(() => ({
        data: null,
      })),
      getAllServices().catch(() => ({
        data: [],
      })),
      getSpecialists().catch(() => ({
        data: [],
      })),
      getFAQs().catch(() => ({
        data: [],
      })),
    ]);
  const settings = settingsResponse.data;

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {isSectionVisible(settings, "servicesTabToggle") ? (
        <ServicesPageHeroSection services={servicesResponse.data} />
      ) : null}
      <IntroVideoSection />
      {isSectionVisible(settings, "ourSpecialistsTabToggle") ? (
        <SpecialistsSection specialists={specialistsResponse.data} />
      ) : null}
      {isSectionVisible(settings, "faQsTabToggle") ? (
        <FAQSection faqs={faqsResponse.data} />
      ) : null}
      <DentalWebsiteCTASection />
    </main>
  );
}
