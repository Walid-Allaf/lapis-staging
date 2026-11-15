"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n/client";
import { UnderlineWord } from "./underline-word";

function ShieldCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[var(--dental-check-size)] shrink-0"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M10 2.2 16 4.5v4.2c0 3.7-2.4 7-6 8.7-3.6-1.7-6-5-6-8.7V4.5L10 2.2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m7.4 9.8 1.7 1.7 3.7-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function DentalSection() {
  const { t, direction } = useTranslation();
  const isRtl = direction === "rtl";
  const features = t("dental.features", { returnObjects: true }) as string[];

  return (
    <section
      className="dental-section px-site-gutter-mobile py-[var(--dental-section-y-mobile)] lg:px-0 lg:py-[var(--dental-section-y)]"
      aria-labelledby="dental-heading"
      dir={direction}
    >
      <div className="dental-layout mx-auto">
        <div
          className="dental-image-frame"
          data-aos={isRtl ? "fade-left" : "fade-right"}
        >
          <Image
            src="/dental.png"
            alt={t("dental.imageAlt")}
            width={414}
            height={444}
            sizes="(min-width: 1024px) 414px, calc(100vw - 40px)"
            className="h-full w-full object-cover"
          />
        </div>

        <div
          className="dental-copy"
          data-aos={isRtl ? "fade-right" : "fade-left"}
          data-aos-delay="150"
        >
          <h2
            id="dental-heading"
            className="max-w-[var(--dental-copy-width)] font-display text-heading-md font-semibold capitalize leading-title text-primary-foreground lg:text-heading-lg"
          >
            <span>{t("dental.titlePrefix")}</span>{" "}
            <UnderlineWord>{t("dental.titleHighlight")}</UnderlineWord>{" "}
            <span>{t("dental.titleSuffix")}</span>
          </h2>
          <p className="mt-[var(--dental-copy-gap)] max-w-[var(--dental-body-width)] text-body-lg text-primary-foreground">
            {t("dental.body")}
          </p>

          <ul className="mt-[var(--dental-list-gap)] flex flex-col gap-[var(--dental-list-item-gap)] text-body-lg font-medium text-primary-foreground">
            {features.map((feature, index) => (
              <li
                key={feature}
                className="flex items-center gap-[var(--dental-check-gap)]"
                data-aos="fade-up"
                data-aos-delay={index * 80}
              >
                <ShieldCheckIcon />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
