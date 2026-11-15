"use client";

import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import type { LandingService } from "@/lib/api/services";
import { useTranslation } from "@/lib/i18n/client";

type ServicesSectionProps = {
  services: LandingService[];
};

export function ServicesSection({ services }: ServicesSectionProps) {
  const { t, direction } = useTranslation();

  return (
    <section
      className="bg-background px-site-gutter-mobile py-12 lg:px-0 lg:py-0"
      aria-labelledby="services-heading"
      dir={direction}
    >
      <div
        className="mx-auto max-w-site bg-brand-navy px-6 py-10 lg:px-[35px] lg:py-[50px] rounded-sm"
        data-aos="fade-up"
      >
        <h2 id="services-heading" className="sr-only">
          {t("services.sectionLabel")}
        </h2>

        {services.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-6">
            {services.map((service, index) => (
              <ServiceCard
                animationDelay={index * 100}
                key={service.id}
                service={service}
              />
            ))}
          </div>
        ) : (
          <p className="bg-white p-8 text-center text-body">{t("services.empty")}</p>
        )}
      </div>

      <div className="mt-8 flex justify-center" data-aos="fade-up" data-aos-delay="200">
        <Link
          href="/services"
          data-services-view-all
          className="inline-flex h-[var(--button-height)] items-center justify-center bg-gold px-9 text-nav font-bold text-gold-foreground transition-colors hover:bg-primary-hover rounded-sm"
        >
          {t("services.viewAll")}
        </Link>
      </div>
    </section>
  );
}
