"use client";

import Image from "next/image";
import Link from "next/link";
import type {
  BlogPostsPaging,
  LandingBlogPost,
} from "@/lib/api/blog-posts";
import { useTranslation } from "@/lib/i18n/client";
import { SiteLogo } from "./site-logo";
import { UnderlineWord } from "./underline-word";

export type BlogFeaturedFilter = "all" | "featured" | "not-featured";

export type BlogListFilters = {
  featured: BlogFeaturedFilter;
  pageNumber: number;
  pageSize: number;
  search: string;
};

type BlogPageHeroSectionProps = {
  filters: BlogListFilters;
  paging?: BlogPostsPaging;
  posts: LandingBlogPost[];
};

type BlogCardProps = {
  animationDelay?: number;
  post: LandingBlogPost;
};

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none">
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

function UserIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none">
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
    month: "short",
    year: "numeric",
  }).format(date);
}

function buildBlogPageHref({
  featured,
  pageNumber,
  search,
}: {
  featured: BlogFeaturedFilter;
  pageNumber: number;
  search: string;
}) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (featured !== "all") {
    params.set("featured", featured);
  }

  if (pageNumber > 1) {
    params.set("page", String(pageNumber));
  }

  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

function createPageRange(currentPage: number, pageCount: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(pageCount, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
}

function BlogCard({ animationDelay = 0, post }: BlogCardProps) {
  const { language, t } = useTranslation();
  const isArabic = language === "ar";
  const title = isArabic ? post.titleAr : post.titleEn;
  const summary = isArabic ? post.summaryAr : post.summaryEn;
  const specialistName =
    (isArabic ? post.ourSpecialist?.nameAr : post.ourSpecialist?.nameEn) ||
    t("blogPage.specialistFallback");

  return (
    <Link
      href={`/blog/${encodeURIComponent(post.slug)}`}
      className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-[var(--service-card-border-color)] bg-white text-start no-underline shadow-[var(--shadow-token-md)] transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[var(--shadow-token-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      data-aos="fade-up"
      data-aos-delay={animationDelay}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={t("blogPage.imageAlt", { title })}
            fill
            sizes="(min-width: 1024px) 380px, calc(100vw - 40px)"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-brand-navy px-10">
            <SiteLogo className="max-h-14" variant="whiteGold" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 py-6">
        <div className="flex flex-wrap gap-3 text-body-sm font-semibold text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-2">
            <CalendarIcon />
            {formatDate(post.createdAt, language)}
          </span>
          <span className="inline-flex items-center gap-2">
            <UserIcon />
            {specialistName}
          </span>
        </div>

        <h2 className="mt-4 font-display text-heading-sm font-semibold leading-title text-primary">
          {title}
        </h2>
        <p className="mt-3 line-clamp-3 text-body-md leading-body text-[var(--color-muted)]">
          {summary}
        </p>

        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-nav font-bold text-gold transition group-hover:text-primary">
          {t("blogPage.readArticle")}
          <span
            className={isArabic ? "rotate-180 transition" : "transition"}
            aria-hidden="true"
          >
            <ArrowIcon />
          </span>
        </span>
      </div>
    </Link>
  );
}

export function BlogPageHeroSection({
  filters,
  paging,
  posts,
}: BlogPageHeroSectionProps) {
  const { direction, t } = useTranslation();
  const totalRecords = paging?.totalRecords ?? posts.length;
  const pageSize = paging?.pageSize ?? filters.pageSize;
  const currentPage = paging?.pageNumber ?? filters.pageNumber;
  const pageCount = Math.max(1, Math.ceil(totalRecords / pageSize));
  const pageRange = createPageRange(currentPage, pageCount);

  return (
    <section
      aria-labelledby="blog-page-heading"
      className="bg-background px-site-gutter-mobile pb-16 pt-10 lg:px-site-gutter lg:pb-20 lg:pt-4"
      dir={direction}
    >
      <div className="mx-auto max-w-site">
        <div className="mx-auto max-w-[680px] text-center" data-aos="fade-up">
          <h1
            id="blog-page-heading"
            className="font-display text-heading-lg font-semibold leading-heading text-primary lg:text-heading-xl"
          >
            <UnderlineWord>{t("blogPage.title")}</UnderlineWord>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-body-lg leading-body text-[var(--color-muted)]">
            {t("blogPage.body")}
          </p>
        </div>

        <form
          action="/blog"
          className="mt-12 grid gap-4 rounded-[10px] border border-[var(--service-card-border-color)] bg-white p-4 shadow-[var(--shadow-token-sky)] md:grid-cols-[1fr_220px_auto_auto] md:items-end lg:mt-16"
          data-aos="fade-up"
          method="get"
        >
          <label className="grid gap-2 text-start text-nav font-bold text-ink">
            {t("blogPage.filters.searchLabel")}
            <input
              className="h-12 rounded-[5px] border border-[var(--service-card-border-color)] bg-white px-4 text-body-md font-normal text-ink outline-none transition placeholder:text-[var(--color-muted)] focus:border-gold"
              defaultValue={filters.search}
              name="search"
              placeholder={t("blogPage.filters.searchPlaceholder")}
              type="search"
            />
          </label>

          <label className="grid gap-2 text-start text-nav font-bold text-ink">
            {t("blogPage.filters.featuredLabel")}
            <select
              className="h-12 rounded-[5px] border border-[var(--service-card-border-color)] bg-white px-4 text-body-md font-normal text-ink outline-none transition focus:border-gold"
              defaultValue={filters.featured}
              name="featured"
            >
              <option value="all">{t("blogPage.filters.all")}</option>
              <option value="featured">{t("blogPage.filters.featured")}</option>
              <option value="not-featured">
                {t("blogPage.filters.notFeatured")}
              </option>
            </select>
          </label>

          <button
            type="submit"
            className="h-12 rounded-[5px] bg-gold px-6 text-nav font-bold text-gold-foreground transition hover:bg-primary-hover"
          >
            {t("blogPage.filters.apply")}
          </button>

          <Link
            href="/blog"
            className="inline-flex h-12 items-center justify-center rounded-[5px] border border-[var(--service-card-border-color)] bg-white px-6 text-nav font-bold text-ink no-underline transition hover:border-gold hover:text-gold"
          >
            {t("blogPage.filters.reset")}
          </Link>
        </form>

        <div
          className="mt-8 flex items-center justify-between gap-4 text-body-md text-[var(--color-muted)]"
          data-aos="fade-up"
        >
          <p>{t("blogPage.resultsCount", { count: totalRecords })}</p>
          <p>{t("blogPage.pageLabel", { current: currentPage, total: pageCount })}</p>
        </div>

        {posts.length > 0 ? (
          <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, index) => (
              <BlogCard
                animationDelay={index * 80}
                key={post.id}
                post={post}
              />
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-14 max-w-[560px] rounded-[10px] border border-[var(--service-card-border-color)] bg-white px-6 py-8 text-center text-body-lg leading-body text-[var(--color-muted)]">
            {t("blogPage.empty")}
          </p>
        )}

        {pageCount > 1 ? (
          <nav
            aria-label={t("blogPage.paginationLabel")}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
            data-aos="fade-up"
          >
            <Link
              aria-disabled={currentPage <= 1}
              href={buildBlogPageHref({
                ...filters,
                pageNumber: Math.max(1, currentPage - 1),
              })}
              className={`inline-flex h-11 items-center justify-center rounded-[5px] border px-5 text-nav font-bold no-underline transition ${
                currentPage <= 1
                  ? "pointer-events-none border-[var(--service-card-border-color)] text-[var(--color-muted)]"
                  : "border-[var(--service-card-border-color)] text-ink hover:border-gold hover:text-gold"
              }`}
            >
              {t("blogPage.previousPage")}
            </Link>

            {pageRange.map((pageNumber) => (
              <Link
                key={pageNumber}
                href={buildBlogPageHref({ ...filters, pageNumber })}
                aria-current={pageNumber === currentPage ? "page" : undefined}
                className={`grid size-11 place-items-center rounded-[5px] border text-nav font-bold no-underline transition ${
                  pageNumber === currentPage
                    ? "border-gold bg-gold text-gold-foreground"
                    : "border-[var(--service-card-border-color)] bg-white text-ink hover:border-gold hover:text-gold"
                }`}
              >
                {pageNumber}
              </Link>
            ))}

            <Link
              aria-disabled={currentPage >= pageCount}
              href={buildBlogPageHref({
                ...filters,
                pageNumber: Math.min(pageCount, currentPage + 1),
              })}
              className={`inline-flex h-11 items-center justify-center rounded-[5px] border px-5 text-nav font-bold no-underline transition ${
                currentPage >= pageCount
                  ? "pointer-events-none border-[var(--service-card-border-color)] text-[var(--color-muted)]"
                  : "border-[var(--service-card-border-color)] text-ink hover:border-gold hover:text-gold"
              }`}
            >
              {t("blogPage.nextPage")}
            </Link>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
