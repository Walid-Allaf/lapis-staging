"use client";

import Image from "next/image";
import Link from "next/link";
import type { LandingService } from "@/lib/api/services";
import { useTranslation } from "@/lib/i18n/client";

type ServiceCardProps = {
  animationDelay?: number;
  service: LandingService;
  variant?: "compact" | "page";
};

function ToothIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 48 48" fill="none">
      <path
        d="M15.4 8.6c3.4-2 6.8-.8 8.6.3 1.8-1.1 5.2-2.3 8.6-.3 5.4 3.2 5 10.2 3.1 15.3-.7 1.9-1 4.5-1.3 7-.5 4.8-1.1 9.5-4.6 9.5-2.3 0-3.2-2.9-4.1-5.8-.5-1.7-1.1-3.5-1.7-3.5s-1.2 1.8-1.7 3.5c-.9 2.9-1.8 5.8-4.1 5.8-3.5 0-4.1-4.7-4.6-9.5-.3-2.5-.6-5.1-1.3-7-1.9-5.1-2.3-12.1 3.1-15.3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.7"
      />
      <path
        d="M18.6 14.4c1.7-1 3.5-1.1 5.4-.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.7"
      />
    </svg>
  );
}

function ArrowCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-full">
      <circle cx="10" cy="10" r="8.8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8.8 6.7 3.3 3.3-3.3 3.3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ServiceCard({
  animationDelay = 0,
  service,
  variant = "compact",
}: ServiceCardProps) {
  const { t, language } = useTranslation();
  const isArabic = language === "ar";
  const name = isArabic ? service.nameAr : service.nameEn;
  const description = isArabic ? service.simpleDescriptionAr : service.simpleDescriptionEn;
  const isPageVariant = variant === "page";

  if (isPageVariant) {
    return (
      <article
        className="services-page-card"
        data-aos="fade-up"
        data-aos-delay={animationDelay}
        data-service-card
      >
        <div className="services-page-icon" aria-hidden="true">
          {service.avatarUrl ? (
            <Image
              src={service.avatarUrl}
              alt={name || t("services.fallbackImageAlt")}
              width={48}
              height={48}
              className="services-page-icon-image"
            />
          ) : (
            <ToothIcon className="size-[var(--services-page-icon-glyph-size)]" />
          )}
        </div>
        <h2 className="services-page-card-title">{name}</h2>
        <p className="services-page-card-body">{description}</p>
        {/*<Link href={`/services/${service.id}`} className="services-page-card-link">*/}
        {/*  {t("services.learnMore")}*/}
        {/*  <span className="services-page-card-link-icon" aria-hidden="true">*/}
        {/*    <ArrowCircleIcon />*/}
        {/*  </span>*/}
        {/*</Link>*/}
      </article>
    );
  }

  return (
    <article
      data-service-card
      data-aos="fade-up"
      data-aos-delay={animationDelay}
      className="flex min-h-[300px] flex-col items-center bg-white px-8 py-7 text-center rounded-sm service-card-bordered"
    >
      <div className="service-avatar mb-6 grid place-items-center">
        {service.avatarUrl ? (
          <Image
            src={service.avatarUrl}
            alt={name || t("services.fallbackImageAlt")}
            width={56}
            height={56}
            className="size-service-avatar-icon rounded-full object-cover"
          />
        ) : (
          <ToothIcon className="size-service-avatar-icon" />
        )}
      </div>
      <h3 className="text-lg font-bold text-ink">{name}</h3>
      <p className="mt-4 line-clamp-3 max-w-[20rem] text-hero-body text-body">
        {description}
      </p>
      {/*<Link*/}
      {/*  href={`/services/${service.id}`}*/}
      {/*  className="mt-auto inline-flex items-center gap-3 pt-6 text-nav font-bold text-ink transition-colors hover:text-gold"*/}
      {/*>*/}
      {/*  {t("services.learnMore")}*/}
      {/*  <span aria-hidden="true" className="text-xl leading-none">*/}
      {/*    {isArabic ? "←" : "→"}*/}
      {/*  </span>*/}
      {/*</Link>*/}
    </article>
  );
}
