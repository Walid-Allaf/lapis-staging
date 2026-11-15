import type { Metadata } from "next";
import {
  BlogPageHeroSection,
  type BlogFeaturedFilter,
} from "@/components/blog-page-hero-section";
import { FAQSection } from "@/components/faq-section";
import { getBlogPosts } from "@/lib/api/blog-posts";
import { getFAQs } from "@/lib/api/faqs";
import { getSettings } from "@/lib/api/settings";
import { resources } from "@/lib/i18n/resources";
import { createPageMetadata } from "@/lib/seo";
import { blogKeywords } from "@/lib/seo-keywords";
import { isSectionVisible } from "@/lib/section-visibility";

const englishSeo = resources.en.common.blogPage;
const arabicSeo = resources.ar.common.blogPage;
const blogPageSize = 12;

type BlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePageNumber(value: string | string[] | undefined) {
  const pageNumber = Number(getSearchValue(value));

  return Number.isFinite(pageNumber) && pageNumber > 0
    ? Math.floor(pageNumber)
    : 1;
}

function parseFeaturedFilter(
  value: string | string[] | undefined,
): BlogFeaturedFilter {
  const featured = getSearchValue(value);

  if (featured === "featured" || featured === "not-featured") {
    return featured;
  }

  return "all";
}

function featuredFilterToApiValue(filter: BlogFeaturedFilter) {
  if (filter === "featured") {
    return true;
  }

  if (filter === "not-featured") {
    return false;
  }

  return null;
}

export function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    en: englishSeo,
    ar: arabicSeo,
    path: "/blog",
    keywords: blogKeywords,
  });
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const search = (getSearchValue(params.search) ?? "").trim();
  const featured = parseFeaturedFilter(params.featured);
  const pageNumber = parsePageNumber(params.page);

  const [settingsResponse, postsResponse, faqsResponse] = await Promise.all([
    getSettings().catch(() => ({
      data: null,
    })),
    getBlogPosts({
      isFeatured: featuredFilterToApiValue(featured),
      pageNumber,
      pageSize: blogPageSize,
      search,
    }).catch(() => ({
      data: [],
      paging: {
        pageNumber,
        pageSize: blogPageSize,
        totalRecords: 0,
      },
    })),
    getFAQs().catch(() => ({
      data: [],
    })),
  ]);
  const settings = settingsResponse.data;

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <BlogPageHeroSection
        filters={{
          featured,
          pageNumber,
          pageSize: blogPageSize,
          search,
        }}
        paging={postsResponse.paging}
        posts={postsResponse.data}
      />
      {isSectionVisible(settings, "faQsTabToggle") ? (
        <FAQSection faqs={faqsResponse.data} />
      ) : null}
    </main>
  );
}
