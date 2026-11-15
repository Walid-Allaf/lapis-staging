"use client";

import Image from "next/image";
import { useState } from "react";
import type { LandingGallery } from "@/lib/api/galleries";
import { useTranslation } from "@/lib/i18n/client";
import { UnderlineWord } from "./underline-word";

type GalleryPageHeroSectionProps = {
  galleries: LandingGallery[];
};

type BeforeAfterCardProps = {
  animationDelay?: number;
  gallery: LandingGallery;
};

function BeforeAfterCard({ animationDelay = 0, gallery }: BeforeAfterCardProps) {
  const [position, setPosition] = useState(50);
  const { direction, language, t } = useTranslation();
  const isArabic = language === "ar";
  const isRtl = direction === "rtl";
  const title = isArabic ? gallery.titleAr : gallery.titleEn;
  const description = isArabic ? gallery.descriptionAr : gallery.descriptionEn;
  const afterClipPath = isRtl
    ? `inset(0 0 0 ${position}%)`
    : `inset(0 ${100 - position}% 0 0)`;

  return (
    <article
      className="overflow-hidden rounded-[10px] border border-[var(--service-card-border-color)] bg-white shadow-[var(--shadow-token-md)]"
      data-aos="fade-up"
      data-aos-delay={animationDelay}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
        {gallery.beforeImageUrl ? (
          <Image
            src={gallery.beforeImageUrl}
            alt={`${title} ${t("galleryPage.before")}`}
            fill
            sizes="(min-width: 1024px) 560px, calc(100vw - 40px)"
            className="object-cover"
          />
        ) : null}

        {gallery.afterImageUrl ? (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: afterClipPath }}
          >
            <Image
              src={gallery.afterImageUrl}
              alt={`${title} ${t("galleryPage.after")}`}
              fill
              sizes="(min-width: 1024px) 560px, calc(100vw - 40px)"
              className="object-cover"
            />
          </div>
        ) : null}

        <div
          className="absolute inset-x-4 top-4 flex justify-between text-body-sm font-bold text-white"
          dir={direction}
        >
          <span className="rounded-[5px] bg-ink/75 px-3 py-1">
            {t("galleryPage.after")}
          </span>
          <span className="rounded-[5px] bg-ink/75 px-3 py-1">
            {t("galleryPage.before")}
          </span>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_18px_rgb(0_0_0_/_0.35)]"
          style={{ left: `${position}%` }}
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-gold-foreground shadow-[var(--shadow-token-avatar)]"
          style={{ left: `${position}%` }}
        >
          <span className="flex items-center gap-1 text-2xl font-bold leading-none">
            <span>‹</span>
            <span>›</span>
          </span>
        </div>

        <input
          aria-label={t("galleryPage.sliderLabel")}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          dir="ltr"
          max={100}
          min={0}
          onChange={(event) => setPosition(Number(event.target.value))}
          type="range"
          value={position}
        />
      </div>

      <div className="px-6 py-6 text-start">
        <h2 className="font-display text-heading-sm font-semibold leading-title text-primary">
          {title}
        </h2>
        <p className="mt-3 text-body-md leading-body text-[var(--color-muted)]">
          {description}
        </p>
      </div>
    </article>
  );
}

export function GalleryPageHeroSection({ galleries }: GalleryPageHeroSectionProps) {
  const { direction, t } = useTranslation();

  return (
    <section
      aria-labelledby="gallery-page-heading"
      className="bg-background px-site-gutter-mobile pb-16 pt-10 lg:px-site-gutter lg:pb-20 lg:pt-4"
      dir={direction}
    >
      <div className="mx-auto max-w-site">
        <div className="mx-auto text-center" data-aos="fade-up">
          <h1
            id="gallery-page-heading"
            className="font-display text-heading-lg font-semibold leading-heading text-primary lg:text-heading-xl"
          >
            <UnderlineWord>{t("galleryPage.title")}</UnderlineWord>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-body-lg leading-body text-[var(--color-muted)]">
            {t("galleryPage.body")}
          </p>
        </div>

        {galleries.length > 0 ? (
          <div className="mt-14 grid gap-8 lg:mt-20 lg:grid-cols-2">
            {galleries.map((gallery, index) => (
              <BeforeAfterCard
                animationDelay={index * 100}
                gallery={gallery}
                key={gallery.id}
              />
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-14 max-w-[560px] rounded-[10px] border border-[var(--service-card-border-color)] bg-white px-6 py-8 text-center text-body-lg leading-body text-[var(--color-muted)]">
            {t("galleryPage.empty")}
          </p>
        )}
      </div>
    </section>
  );
}
