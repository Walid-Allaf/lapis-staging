"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n/client";

export function DentalWebsiteCTASection() {
  const { t, direction } = useTranslation();

  return (
    <section
      className="dental-website-cta-section px-site-gutter-mobile py-[var(--dental-website-cta-section-y-mobile)] lg:px-0 lg:py-[var(--dental-website-cta-section-y)]"
      aria-labelledby="dental-website-cta-heading"
      dir={direction}
    >
      <div className="dental-website-cta-card mx-auto" data-aos="fade-up">
        <div className="dental-website-cta-copy" data-aos="fade-up" data-aos-delay="100">
          <h2
            id="dental-website-cta-heading"
            className="max-w-[var(--dental-website-cta-title-width)] font-display text-heading-md font-semibold capitalize leading-title text-white lg:text-heading-lg"
          >
            {t("dentalWebsiteCta.title")}
          </h2>
          <p className="mt-[var(--dental-website-cta-copy-gap)] max-w-[var(--dental-website-cta-body-width)] text-body-lg text-white">
            {t("dentalWebsiteCta.body")}
          </p>
          <button type="button" className="dental-website-cta-button">
            {t("dentalWebsiteCta.learnMore")}
          </button>
        </div>

        <div
          className="dental-website-cta-image-frame"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          <Image
            src="/dental-website-cta-section.png"
            alt={t("dentalWebsiteCta.imageAlt")}
            width={305}
            height={292}
            sizes="(min-width: 1024px) 305px, calc(100vw - 40px)"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
