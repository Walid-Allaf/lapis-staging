"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n/client";
import { UnderlineWord } from "./underline-word";

export function WelcomingSection() {
  const { t, direction } = useTranslation();
  const isRtl = direction === "rtl";

  return (
    <section
      className="bg-background px-site-gutter-mobile py-14 lg:px-0 lg:py-[var(--welcome-section-y)]"
      aria-labelledby="welcoming-heading"
      dir={direction}
    >
      <div className="welcome-layout mx-auto">
        <div
          className="welcome-copy"
          data-aos={isRtl ? "fade-left" : "fade-right"}
        >
          <h2
            id="welcoming-heading"
            className="max-w-[var(--welcome-title-width)] font-display text-heading-md font-semibold leading-title text-primary lg:text-heading-lg"
          >
            <span>{t("welcoming.titlePrefix")}</span>{" "}
            <UnderlineWord>{t("welcoming.titleHighlight")}</UnderlineWord>{" "}
            <span>{t("welcoming.titleSuffix")}</span>
          </h2>
          <p className="mt-[var(--welcome-copy-gap)] max-w-[var(--welcome-body-width)] text-body-lg text-[var(--color-muted)]">
            {t("welcoming.body")}
          </p>
        </div>

        <div
          className="welcome-visual"
          data-aos={isRtl ? "fade-right" : "fade-left"}
          data-aos-delay="150"
        >
          <div className="welcome-visual-gradient" aria-hidden="true" />
          <div className="welcome-image-frame">
            <Image
              src="/welcoming.png"
              alt={t("welcoming.imageAlt")}
              width={413}
              height={362}
              sizes="(min-width: 1024px) 413px, calc(100vw - 40px)"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
