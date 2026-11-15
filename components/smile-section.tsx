"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n/client";
import { UnderlineWord } from "./underline-word";

export function SmileSection() {
  const { t, direction } = useTranslation();
  const isRtl = direction === "rtl";

  return (
    <section
      className="bg-background px-site-gutter-mobile py-14 lg:px-0 lg:py-[var(--smile-section-y)]"
      aria-labelledby="smile-heading"
      dir={direction}
    >
      <div className="smile-layout mx-auto">
        <div
          className="smile-copy"
          data-aos={isRtl ? "fade-left" : "fade-right"}
        >
          <h2
            id="smile-heading"
            className="max-w-[var(--smile-title-width)] font-display text-heading-md font-semibold capitalize leading-title text-primary lg:text-heading-lg"
          >
            <span>{t("smile.titlePrefix")}</span>{" "}
            <UnderlineWord>{t("smile.titleHighlight")}</UnderlineWord>{" "}
            <span>{t("smile.titleSuffix")}</span>
          </h2>
          <p className="mt-[var(--smile-copy-gap)] max-w-[var(--smile-body-width)] text-body-lg text-[var(--color-muted)]">
            {t("smile.body")}
          </p>
        </div>

        <div
          className="smile-visual"
          data-aos={isRtl ? "fade-right" : "fade-left"}
          data-aos-delay="150"
        >
          <div className="smile-visual-gradient" aria-hidden="true" />
          <div className="smile-image-frame">
            <Image
              src="/smile.png"
              alt={t("smile.imageAlt")}
              width={411}
              height={327}
              sizes="(min-width: 1024px) 411px, calc(100vw - 40px)"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
