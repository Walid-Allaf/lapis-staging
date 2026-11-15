"use client";

import Image from "next/image";
import Link from "next/link";
import type { LandingBlogPost } from "@/lib/api/blog-posts";
import { useTranslation } from "@/lib/i18n/client";
import { SiteLogo } from "./site-logo";
import { UnderlineWord } from "./underline-word";

type BlogDetailSectionProps = {
  post: LandingBlogPost;
};

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v3m10-3v3M4.5 9.2h15M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ArrowIcon({ isArabic }: { isArabic: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={isArabic ? "size-5 rotate-180" : "size-5"}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function formatDate(value: string, language: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "ar" ? "ar" : "en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function BlogDetailSection({ post }: BlogDetailSectionProps) {
  const { direction, language, t } = useTranslation();
  const isArabic = language === "ar";
  const title = isArabic ? post.titleAr : post.titleEn;
  const summary = isArabic ? post.summaryAr : post.summaryEn;
  const content = isArabic ? post.contentAr : post.contentEn;
  const specialistName = isArabic
    ? post.ourSpecialist?.nameAr
    : post.ourSpecialist?.nameEn;
  const specialistRole = isArabic
    ? post.ourSpecialist?.specialistAr
    : post.ourSpecialist?.specialistEn;
  const specialistDescription = isArabic
    ? post.ourSpecialist?.descriptionAr
    : post.ourSpecialist?.descriptionEn;

  return (
    <section
      aria-labelledby="blog-detail-heading"
      className="bg-background px-site-gutter-mobile pb-16 pt-10 lg:px-site-gutter lg:pb-20 lg:pt-4"
      dir={direction}
    >
      <div className="mx-auto max-w-site">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-nav font-bold text-gold no-underline transition hover:text-primary"
          data-aos="fade-up"
        >
          <ArrowIcon isArabic={!isArabic} />
          {t("blogDetail.backToBlog")}
        </Link>

        <article className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <div>
            <header className="max-w-4xl" data-aos="fade-up">
              {post.isFeatured ? (
                <span className="inline-flex rounded-[5px] bg-gold px-4 py-2 text-body-sm font-bold text-gold-foreground">
                  {t("blogDetail.featuredBadge")}
                </span>
              ) : null}
              <h1
                id="blog-detail-heading"
                className="mt-5 font-display text-heading-lg font-semibold leading-heading text-primary lg:text-heading-xl"
              >
                <UnderlineWord>{title}</UnderlineWord>
              </h1>
              <p className="mt-5 max-w-3xl text-body-lg leading-body text-[var(--color-muted)]">
                {summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-body-md font-semibold text-[var(--color-muted)]">
                <span className="inline-flex items-center gap-2">
                  <CalendarIcon />
                  {t("blogDetail.publishedAt", {
                    date: formatDate(post.createdAt, language),
                  })}
                </span>
                {post.updatedAt ? (
                  <span>
                    {t("blogDetail.updatedAt", {
                      date: formatDate(post.updatedAt, language),
                    })}
                  </span>
                ) : null}
              </div>
            </header>

            <div
              className="relative mt-10 aspect-[16/8.5] overflow-hidden rounded-[10px] border border-[var(--service-card-border-color)] bg-surface-muted shadow-[var(--shadow-token-md)]"
              data-aos="fade-up"
            >
              {post.imageUrl ? (
                <Image
                  src={post.imageUrl}
                  alt={t("blogPage.imageAlt", { title })}
                  fill
                  priority
                  sizes="(min-width: 1024px) 820px, calc(100vw - 40px)"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-brand-navy px-10">
                  <SiteLogo className="max-h-20" variant="whiteGold" />
                </div>
              )}
            </div>

            <div
              className="mt-10 rounded-[10px] border border-[var(--service-card-border-color)] bg-white px-6 py-8 text-start text-body-lg leading-body text-ink shadow-[var(--shadow-token-sky)] sm:px-8 lg:px-10 [&_a]:font-bold [&_a]:text-gold [&_blockquote]:border-s-4 [&_blockquote]:border-gold [&_blockquote]:ps-5 [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-heading-md [&_h2]:font-semibold [&_h2]:leading-title [&_h2]:text-primary [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-heading-sm [&_h3]:font-semibold [&_h3]:text-primary [&_li]:mb-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:mb-5 [&_strong]:text-primary [&_ul]:my-5 [&_ul]:list-disc [&_ul]:ps-6"
              data-aos="fade-up"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          <aside
            className="rounded-[10px] border border-[var(--service-card-border-color)] bg-white p-6 text-start shadow-[var(--shadow-token-md)] lg:sticky lg:top-8"
            data-aos="fade-up"
            data-aos-delay="120"
          >
            <p className="text-nav font-bold text-gold">
              {t("blogDetail.specialistLabel")}
            </p>
            {post.ourSpecialist ? (
              <div className="mt-5">
                <div className="flex items-center gap-4">
                  <div className="relative size-16 overflow-hidden rounded-full bg-surface-muted">
                    {post.ourSpecialist.imageUrl ? (
                      <Image
                        src={post.ourSpecialist.imageUrl}
                        alt={specialistName || t("blogPage.specialistFallback")}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center bg-brand-navy text-xl font-bold text-gold">
                        {specialistName?.charAt(0) || "L"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-heading-sm font-bold leading-title text-primary">
                      {specialistName}
                    </h2>
                    {specialistRole ? (
                      <p className="mt-1 text-body-md text-[var(--color-muted)]">
                        {specialistRole}
                      </p>
                    ) : null}
                  </div>
                </div>

                {specialistDescription ? (
                  <div
                    className="mt-5 text-body-md leading-body text-[var(--color-muted)] [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: specialistDescription }}
                  />
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-body-md leading-body text-[var(--color-muted)]">
                {t("blogPage.specialistFallback")}
              </p>
            )}
          </aside>
        </article>
      </div>
    </section>
  );
}
