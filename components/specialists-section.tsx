"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { LandingSpecialist } from "@/lib/api/specialists";
import { useTranslation } from "@/lib/i18n/client";

type SpecialistsSectionProps = {
  specialists: LandingSpecialist[];
};

function ArrowIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      aria-hidden="true"
      className="size-[var(--specialists-arrow-icon-size)]"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d={direction === "previous" ? "M15 5 8 12l7 7" : "m9 5 7 7-7 7"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function SpecialistsSection({ specialists }: SpecialistsSectionProps) {
  const { t, language, direction } = useTranslation();
  const isArabic = language === "ar";
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollToCard(nextIndex: number) {
    if (specialists.length === 0) {
      return;
    }

    const boundedIndex = (nextIndex + specialists.length) % specialists.length;
    const track = trackRef.current;
    const card = track?.children.item(boundedIndex) as HTMLElement | null;

    card?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    setActiveIndex(boundedIndex);
  }

  return (
    <section
      className="specialists-section px-site-gutter-mobile py-[var(--specialists-section-y-mobile)] lg:px-0 lg:py-[var(--specialists-section-y)]"
      aria-labelledby="specialists-heading"
      dir={direction}
    >
      <div className="specialists-background" aria-hidden="true" />
      <div className="specialists-content mx-auto">
        <div
          className="mx-auto max-w-[var(--specialists-title-width)] text-center"
          data-aos="fade-up"
        >
          <h2
            id="specialists-heading"
            className="font-display text-heading-md font-semibold capitalize leading-title text-white lg:text-heading-lg"
          >
            {t("specialists.title")}
          </h2>
          <p className="mx-auto mt-[var(--specialists-copy-gap)] max-w-[var(--specialists-body-width)] text-body-lg text-[var(--color-muted)]">
            {t("specialists.body")}
          </p>
        </div>

        {specialists.length > 0 ? (
          <>
            <div
              ref={trackRef}
              className="specialists-track"
              aria-label={t("specialists.carouselLabel")}
              data-aos="fade-up"
              data-aos-delay="150"
            >
              {specialists.map((specialist, index) => {
                const name = isArabic ? specialist.nameAr : specialist.nameEn;
                const role = isArabic ? specialist.specialistAr : specialist.specialistEn;
                const description = isArabic
                  ? specialist.descriptionAr
                  : specialist.descriptionEn;

                return (
                  <article
                    key={specialist.id}
                    className="specialist-card"
                    aria-label={`${name}, ${role}`}
                    data-aos="fade-up"
                    data-aos-delay={index * 90}
                  >
                    <div className="specialist-image-frame">
                      {specialist.imageUrl ? (
                        <Image
                          src={specialist.imageUrl}
                          alt={name}
                          width={305}
                          height={340}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="specialist-image-fallback" aria-hidden="true">
                          <span>{name.trim().charAt(0) || t("specialists.fallbackInitial")}</span>
                        </div>
                      )}
                    </div>
                    <div className="specialist-card-panel">
                      <h3 className="text-lg font-medium leading-heading text-white">{name}</h3>
                      <p className="mt-1 text-body-md text-white/90">{role}</p>
                      <p className="sr-only">{description}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div
              className="specialists-controls"
              data-aos="fade-up"
              data-aos-delay="250"
              dir="ltr"
            >
              <button
                type="button"
                className="specialists-arrow"
                aria-label={t("specialists.previous")}
                onClick={() => scrollToCard(activeIndex - 1)}
              >
                <ArrowIcon direction="previous" />
              </button>
              <button
                type="button"
                className="specialists-arrow"
                aria-label={t("specialists.next")}
                onClick={() => scrollToCard(activeIndex + 1)}
              >
                <ArrowIcon direction="next" />
              </button>
            </div>
          </>
        ) : (
          <p className="specialists-empty mx-auto">{t("specialists.empty")}</p>
        )}
      </div>
    </section>
  );
}
