"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n/client";
import { UnderlineWord } from "./underline-word";

export function HeroSection() {
  const { t, direction } = useTranslation();

  return (
    <section
      className="relative overflow-hidden bg-background px-site-gutter-mobile lg:px-0"
      dir={direction}
    >
      <div className="relative mx-auto min-h-[var(--layout-hero-min-height)] w-full max-w-site pt-[var(--hero-mobile-copy-top)] lg:pt-[var(--layout-hero-top)]">
        <div
          className="hero-copy relative z-10 max-w-hero-copy"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <h1 className="font-display text-heading-lg font-bold leading-heading text-ink lg:text-hero-title">
            <span>{t("hero.titlePrefix")}</span>{" "}
            <UnderlineWord>{t("hero.titleHighlight")}</UnderlineWord>
          </h1>
          <p className="mt-hero-body-gap max-w-hero-body text-hero-body font-normal text-body">
            {t("hero.body")}
          </p>
        </div>

        <div className="hero-visual" data-aos="zoom-in" data-aos-delay="250">
          <Image
            src="/hero-dental-team.png"
            alt={t("hero.imageAlt")}
            width={696}
            height={677}
            priority
            className="relative h-auto w-full max-w-hero-visual object-contain"
          />
        </div>
      </div>
    </section>
  );
}
