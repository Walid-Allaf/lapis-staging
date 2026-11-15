"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n/client";
import { UnderlineWord } from "./underline-word";

export function AboutPageHeroSection() {
  const { direction, t } = useTranslation();
  const isRtl = direction === "rtl";

  return (
    <section
      aria-labelledby="about-page-heading"
      className="bg-background px-site-gutter-mobile pb-16 pt-10 lg:px-site-gutter lg:pb-20 lg:pt-4"
      dir={direction}
    >
      <div className="mx-auto max-w-[1172px]">
        <h1
          id="about-page-heading"
          className="text-center font-display text-heading-lg font-semibold leading-heading text-primary lg:text-heading-xl"
          data-aos="fade-up"
        >
          <UnderlineWord>{t("aboutPage.title")}</UnderlineWord>
        </h1>

        <div
          className={`mt-16 flex flex-col gap-10 lg:mt-[70px] lg:items-start lg:justify-between lg:gap-[70px] ${
            isRtl ? "lg:flex-row-reverse" : "lg:flex-row"
          }`}
        >
          <div
            className="max-w-[649px] lg:flex-1"
            data-aos={isRtl ? "fade-left" : "fade-right"}
            data-aos-delay="100"
          >
            <h2 className="font-display text-heading-md font-semibold leading-title text-primary lg:text-heading-lg">
              {t("aboutPage.missionTitle")}
            </h2>

            <p className="mt-5 text-body-lg leading-body text-[var(--color-muted)]">
              {t("aboutPage.missionBody")}
            </p>

            <p className="mt-8 max-w-[649px] font-display text-heading-sm font-semibold leading-title text-primary lg:text-[1.625rem]">
              {t("aboutPage.highlight")}
            </p>

            <p className="mt-11 text-body-lg leading-body text-[var(--color-muted)]">
              {t("aboutPage.body")}
            </p>
          </div>

          <div
            className="w-full overflow-hidden rounded-[10px] bg-surface-muted lg:w-[453px] lg:flex-none"
            data-aos={isRtl ? "fade-right" : "fade-left"}
            data-aos-delay="200"
          >
            <Image
              src="/about.png"
              alt={t("aboutPage.imageAlt")}
              width={453}
              height={603}
              priority
              sizes="(min-width: 1024px) 453px, calc(100vw - 40px)"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
