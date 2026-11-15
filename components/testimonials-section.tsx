"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { LandingTestimonial } from "@/lib/api/testimonials";
import { useTranslation } from "@/lib/i18n/client";

type TestimonialsSectionProps = {
  testimonials: LandingTestimonial[];
};

function ArrowIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      aria-hidden="true"
      className="size-[var(--testimonials-arrow-icon-size)]"
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

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="size-[var(--testimonials-star-size)]"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        className={active ? "text-warning" : "text-border"}
        d="m10 1.7 2.4 5 5.5.8-4 3.9 1 5.5-4.9-2.6-4.9 2.6 1-5.5-4-3.9 5.5-.8 2.4-5Z"
      />
    </svg>
  );
}

function isPlaceholder(value: string) {
  return value.trim().toLowerCase() === "string";
}

function ratingFrom(value: number) {
  if (!Number.isFinite(value) || value < 1) {
    return 5;
  }

  return Math.min(Math.max(Math.round(value), 1), 5);
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const { t, language, direction } = useTranslation();
  const isArabic = language === "ar";
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollToCard(nextIndex: number) {
    if (testimonials.length === 0) {
      return;
    }

    const boundedIndex = (nextIndex + testimonials.length) % testimonials.length;
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
      className="testimonials-section px-site-gutter-mobile py-[var(--testimonials-section-y-mobile)] lg:px-0 lg:py-[var(--testimonials-section-y)]"
      aria-labelledby="testimonials-heading"
      dir={direction}
    >
      <div className="testimonials-content mx-auto">
        <div
          className="mx-auto max-w-[var(--testimonials-title-width)] text-center"
          data-aos="fade-up"
        >
          <h2
            id="testimonials-heading"
            className="font-display text-heading-md font-semibold capitalize leading-title text-primary lg:text-heading-lg"
          >
            {t("testimonials.title")}
          </h2>
          <p className="mx-auto mt-[var(--testimonials-copy-gap)] max-w-[var(--testimonials-body-width)] text-body-md text-[var(--color-muted)] lg:text-body-md">
            {t("testimonials.body")}
          </p>
        </div>

        {testimonials.length > 0 ? (
          <>
            <div
              ref={trackRef}
              className="testimonials-track"
              aria-label={t("testimonials.carouselLabel")}
              data-aos="fade-up"
              data-aos-delay="150"
            >
              {testimonials.map((testimonial, index) => {
                const rawName = isArabic ? testimonial.titleAr : testimonial.titleEn;
                const rawDescription = isArabic
                  ? testimonial.descriptionAr
                  : testimonial.descriptionEn;
                const name = isPlaceholder(rawName)
                  ? t("testimonials.fallbackName")
                  : rawName;
                const description = isPlaceholder(rawDescription)
                  ? t("testimonials.fallbackDescription")
                  : rawDescription;
                const rating = ratingFrom(testimonial.starNumber);

                return (
                  <article
                    key={testimonial.id}
                    className="testimonial-card"
                    data-aos="fade-up"
                    data-aos-delay={index * 90}
                  >
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">
                        {testimonial.avatarUrl ? (
                          <Image
                            src={testimonial.avatarUrl}
                            alt={name}
                            width={70}
                            height={70}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span aria-hidden="true">
                            {name.trim().charAt(0) || t("testimonials.fallbackInitial")}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-medium leading-body text-ink">
                          {name}
                        </h3>
                        <div
                          className="testimonial-stars"
                          aria-label={`${rating} ${t("testimonials.ratingSuffix")}`}
                        >
                          {Array.from({ length: 5 }, (_, index) => (
                            <StarIcon key={index} active={index < rating} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="testimonial-description">{description}</p>
                  </article>
                );
              })}
            </div>

            <div
              className="testimonials-controls"
              data-aos="fade-up"
              data-aos-delay="250"
              dir="ltr"
            >
              <button
                type="button"
                className="testimonials-arrow"
                aria-label={t("testimonials.previous")}
                onClick={() => scrollToCard(activeIndex - 1)}
              >
                <ArrowIcon direction="previous" />
              </button>
              <button
                type="button"
                className="testimonials-arrow"
                aria-label={t("testimonials.next")}
                onClick={() => scrollToCard(activeIndex + 1)}
              >
                <ArrowIcon direction="next" />
              </button>
            </div>
          </>
        ) : (
          <p className="testimonials-empty mx-auto">{t("testimonials.empty")}</p>
        )}
      </div>
    </section>
  );
}
