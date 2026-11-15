import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailSection } from "@/components/blog-detail-section";
import {
  getBlogPostBySlug,
  type LandingBlogPost,
} from "@/lib/api/blog-posts";
import { resources } from "@/lib/i18n/resources";
import { createPageMetadata, getSeoLanguage } from "@/lib/seo";
import { blogKeywords } from "@/lib/seo-keywords";
import {
  createAbsoluteUrl,
  formatSeoTitle,
  seoBrandNames,
  seoSiteDescriptions,
} from "@/lib/seo-shared";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function isUsefulText(value: string | null | undefined): value is string {
  return Boolean(value && value.trim() && value.trim().toLowerCase() !== "string");
}

function firstUsefulText(...values: Array<string | null | undefined>) {
  return values.find(isUsefulText)?.trim() ?? "";
}

function getLocalizedBlogSeo(post: LandingBlogPost, language: "ar" | "en") {
  const isArabic = language === "ar";
  const title = firstUsefulText(
    isArabic ? post.metaTitleAr : post.metaTitleEn,
    isArabic ? post.titleAr : post.titleEn,
    post.titleEn,
    post.titleAr,
  );
  const description = firstUsefulText(
    isArabic ? post.metaDescriptionAr : post.metaDescriptionEn,
    isArabic ? post.summaryAr : post.summaryEn,
    stripHtml(isArabic ? post.contentAr : post.contentEn),
    post.summaryEn,
    post.summaryAr,
  );

  return {
    title,
    description,
  };
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const [{ data: post }, language] = await Promise.all([
      getBlogPostBySlug(slug),
      getSeoLanguage(),
    ]);
    const localizedSeo = getLocalizedBlogSeo(post, language);
    const alternateSeo = getLocalizedBlogSeo(post, language === "ar" ? "en" : "ar");
    const formattedTitle = formatSeoTitle(localizedSeo.title, language);
    const canonicalUrl = createAbsoluteUrl(
      `/blog/${encodeURIComponent(post.slug)}`,
    );
    const imageUrl = post.imageUrl ?? createAbsoluteUrl("/opengraph-image.png");
    const specialistName =
      (language === "ar"
        ? post.ourSpecialist?.nameAr
        : post.ourSpecialist?.nameEn) ?? seoBrandNames[language];

    return {
      title: localizedSeo.title,
      description: localizedSeo.description,
      keywords: [
        ...blogKeywords,
        post.titleEn,
        post.titleAr,
        post.ourSpecialist?.nameEn,
        post.ourSpecialist?.nameAr,
      ].filter(isUsefulText),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: formattedTitle,
        description: localizedSeo.description,
        type: "article",
        url: canonicalUrl,
        siteName: seoBrandNames[language],
        locale: language === "ar" ? "ar_AR" : "en_US",
        alternateLocale: [language === "ar" ? "en_US" : "ar_AR"],
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        authors: [specialistName],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: formattedTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: formattedTitle,
        description: localizedSeo.description,
        images: {
          url: imageUrl,
          alt: formattedTitle,
        },
      },
      other: {
        [`title:${language}`]: formattedTitle,
        [`description:${language}`]: localizedSeo.description,
        [`title:${language === "ar" ? "en" : "ar"}`]: formatSeoTitle(
          alternateSeo.title,
          language === "ar" ? "en" : "ar",
        ),
        [`description:${language === "ar" ? "en" : "ar"}`]:
          alternateSeo.description,
      },
    };
  } catch {
    return createPageMetadata({
      en: resources.en.common.blogPage,
      ar: resources.ar.common.blogPage,
      path: `/blog/${slug}`,
      keywords: blogKeywords,
    });
  }
}

export default async function BlogPostPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [response, language] = await Promise.all([
    getBlogPostBySlug(slug).catch(() => null),
    getSeoLanguage(),
  ]);

  if (!response?.data || !response.data.isActive) {
    notFound();
  }

  const post = response.data;
  const localizedSeo = getLocalizedBlogSeo(post, language);
  const headline =
    localizedSeo.title || resources[language].common.blogPage.title;
  const description =
    localizedSeo.description || seoSiteDescriptions[language];
  const canonicalUrl = createAbsoluteUrl(
    `/blog/${encodeURIComponent(post.slug)}`,
  );
  const imageUrl = post.imageUrl ?? createAbsoluteUrl("/opengraph-image.png");
  const organizationId = createAbsoluteUrl("/#organization");
  const specialistName = firstUsefulText(
    language === "ar"
      ? post.ourSpecialist?.nameAr
      : post.ourSpecialist?.nameEn,
    post.ourSpecialist?.nameEn,
    post.ourSpecialist?.nameAr,
  );
  const specialistRole = firstUsefulText(
    language === "ar"
      ? post.ourSpecialist?.specialistAr
      : post.ourSpecialist?.specialistEn,
    post.ourSpecialist?.specialistEn,
    post.ourSpecialist?.specialistAr,
  );
  const author = specialistName
    ? {
        "@type": "Person",
        name: specialistName,
        jobTitle: specialistRole || undefined,
        image: post.ourSpecialist?.imageUrl || undefined,
      }
    : {
        "@type": "Organization",
        "@id": organizationId,
        name: seoBrandNames[language],
        url: createAbsoluteUrl("/"),
      };
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#blog-post`,
    url: canonicalUrl,
    headline,
    description,
    image: [imageUrl],
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    inLanguage: language,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    author,
    publisher: {
      "@type": "Organization",
      "@id": organizationId,
      name: "LAPiS Dental Lab",
      url: createAbsoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: createAbsoluteUrl("/brand/logo-dark.png"),
      },
    },
    isPartOf: {
      "@type": "Blog",
      name: resources[language].common.blogPage.title,
      url: createAbsoluteUrl("/blog"),
    },
  };

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <BlogDetailSection post={post} />
    </main>
  );
}
