import type { Metadata } from "next";
import { ContactPageHeroSection } from "@/components/contact-page-hero-section";
import { FAQSection } from "@/components/faq-section";
import { getFAQs } from "@/lib/api/faqs";
import { getSettings } from "@/lib/api/settings";
import { resources } from "@/lib/i18n/resources";
import { createPageMetadata } from "@/lib/seo";
import { contactKeywords } from "@/lib/seo-keywords";
import { isSectionVisible } from "@/lib/section-visibility";

const englishSeo = resources.en.common.contactPage;
const arabicSeo = resources.ar.common.contactPage;

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: englishSeo,
    ar: arabicSeo,
    path: "/contact",
    keywords: contactKeywords,
  });
}

export default async function ContactPage() {
  const [settingsResponse, faqsResponse] = await Promise.all([
    getSettings().catch(() => ({
      data: null,
    })),
    getFAQs().catch(() => ({
      data: [],
    })),
  ]);

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <ContactPageHeroSection settings={settingsResponse.data} />
      {isSectionVisible(settingsResponse.data, "faQsTabToggle") ? (
        <FAQSection faqs={faqsResponse.data} />
      ) : null}
    </main>
  );
}
