"use client";

import { ServiceCard } from "@/components/service-card";
import type { LandingService } from "@/lib/api/services";
import { useTranslation } from "@/lib/i18n/client";
import { UnderlineWord } from "./underline-word";

type ServicesPageHeroSectionProps = {
  services: LandingService[];
};

export function ServicesPageHeroSection({ services }: ServicesPageHeroSectionProps) {
  const { t, direction } = useTranslation();

  return (
    <section
      className="services-page-section px-site-gutter-mobile py-[var(--services-page-section-y-mobile)] lg:px-site-gutter lg:py-[var(--services-page-section-y)]"
      aria-labelledby="services-page-heading"
      dir={direction}
    >
      <div className="services-page-content mx-auto">
        <div
          className="mx-auto text-center"
          data-aos="fade-up"
        >
          <h1
            id="services-page-heading"
            className="font-display text-heading-lg font-semibold leading-title text-primary lg:text-heading-xl"
          >
            <UnderlineWord>{t("servicesPage.title")}</UnderlineWord>
          </h1>
          <p className="mx-auto mt-[var(--services-page-copy-gap)] max-w-[var(--services-page-body-width)] text-body-lg text-[var(--color-muted)]">
            {t("servicesPage.body")}
          </p>
        </div>

        {services.length > 0 ? (
          <div className="services-page-grid">
            {services.map((service, index) => (
              <ServiceCard
                animationDelay={index * 80}
                key={service.id}
                service={service}
                variant="page"
              />
            ))}
          </div>
        ) : (
          <p className="services-page-empty mx-auto">{t("services.empty")}</p>
        )}
      </div>
    </section>
  );
}
