import type { Metadata } from "next";
import { DentalSection } from "@/components/dental-section";
import { DentalWebsiteCTASection } from "@/components/dental-website-cta-section";
import { FAQSection } from "@/components/faq-section";
import { HeroSection } from "@/components/hero-section";
import { IntroVideoSection } from "@/components/intro-video-section";
import { ServicesSection } from "@/components/services-section";
import { SmileSection } from "@/components/smile-section";
import { SpecialistsSection } from "@/components/specialists-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { WelcomingSection } from "@/components/welcoming-section";
import { getFAQs } from "@/lib/api/faqs";
import { getServices } from "@/lib/api/services";
import { getSettings } from "@/lib/api/settings";
import { getSpecialists } from "@/lib/api/specialists";
import { getTestimonials } from "@/lib/api/testimonials";
import { resources } from "@/lib/i18n/resources";
import { homeKeywords } from "@/lib/seo-keywords";
import { createPageMetadata } from "@/lib/seo";
import { isSectionVisible } from "@/lib/section-visibility";

const englishSeo = resources.en.common.homePage;
const arabicSeo = resources.ar.common.homePage;

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    absoluteTitle: true,
    en: englishSeo,
    ar: arabicSeo,
    path: "/",
    keywords: homeKeywords,
  });
}

export default async function Home() {
  const [
    settingsResponse,
    servicesResponse,
    specialistsResponse,
    testimonialsResponse,
    faqsResponse,
  ] = await Promise.all([
    getSettings().catch(() => ({
      data: null,
    })),
    getServices({ pageSize: 3 }).catch(() => ({
      data: [],
    })),
    getSpecialists().catch(() => ({
      data: [],
    })),
    getTestimonials().catch(() => ({
      data: [],
    })),
    getFAQs().catch(() => ({
      data: [],
    })),
  ]);
  const settings = settingsResponse.data;

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <HeroSection />
      {isSectionVisible(settings, "servicesTabToggle") ? (
        <ServicesSection services={servicesResponse.data} />
      ) : null}
      <WelcomingSection />
      <DentalSection />
      <SmileSection />
      <IntroVideoSection />
      {isSectionVisible(settings, "ourSpecialistsTabToggle") ? (
        <SpecialistsSection specialists={specialistsResponse.data} />
      ) : null}
      {isSectionVisible(settings, "testimonialsTabToggle") ? (
        <TestimonialsSection testimonials={testimonialsResponse.data} />
      ) : null}
      {isSectionVisible(settings, "faQsTabToggle") ? (
        <FAQSection faqs={faqsResponse.data} />
      ) : null}
      <DentalWebsiteCTASection />
    </main>
  );
}
