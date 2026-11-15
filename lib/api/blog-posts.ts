import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import { apiFetch, createAssetUrl } from "./client";
import { sanitizeRichText } from "@/lib/sanitize-html";

type ApiImage = {
  id: number;
  filePath: string;
} | null;

export type BlogPostSpecialist = {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  specialistAr: string;
  specialistEn: string;
  image: ApiImage;
  createdAt: string;
  isActive: boolean;
};

export type BlogPost = {
  id: number;
  titleAr: string;
  titleEn: string;
  slug: string;
  summaryAr: string;
  summaryEn: string;
  contentAr: string;
  contentEn: string;
  ourSpecialistId: number;
  ourSpecialist: BlogPostSpecialist | null;
  metaTitleAr: string;
  metaTitleEn: string;
  metaDescriptionAr: string;
  metaDescriptionEn: string;
  status: number;
  isFeatured: boolean;
  order: number;
  image: ApiImage;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export type LandingBlogPostSpecialist = BlogPostSpecialist & {
  imageUrl: string | null;
};

export type LandingBlogPost = Omit<BlogPost, "ourSpecialist"> & {
  imageUrl: string | null;
  ourSpecialist: LandingBlogPostSpecialist | null;
};

export type BlogPostsPaging = {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
};

type GetBlogPostsParams = {
  isActive?: boolean;
  isFeatured?: boolean | null;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
};

function normalizeBlogPost(post: BlogPost): LandingBlogPost {
  return {
    ...post,
    contentAr: sanitizeRichText(post.contentAr),
    contentEn: sanitizeRichText(post.contentEn),
    imageUrl: createAssetUrl(post.image?.filePath),
    ourSpecialist: post.ourSpecialist
      ? {
          ...post.ourSpecialist,
          descriptionAr: sanitizeRichText(post.ourSpecialist.descriptionAr),
          descriptionEn: sanitizeRichText(post.ourSpecialist.descriptionEn),
          imageUrl: createAssetUrl(post.ourSpecialist.image?.filePath),
        }
      : null,
  };
}

function normalizeBlogPosts(posts: BlogPost[]) {
  return posts
    .slice()
    .filter(
      (post) =>
        post.isActive &&
        post.slug.trim() &&
        post.titleAr.trim() &&
        post.titleEn.trim(),
    )
    .sort((first, second) => {
      if (first.order !== second.order) {
        return first.order - second.order;
      }

      return (
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
      );
    })
    .map(normalizeBlogPost);
}

export async function getBlogPosts({
  isActive = true,
  isFeatured = null,
  pageNumber = 1,
  pageSize = 12,
  search = "",
}: GetBlogPostsParams = {}) {
  const response = await apiFetch<BlogPost[]>("/api/BlogPosts/get-all", {
    query: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      Search: search,
      IsActive: isActive,
      IsFeatured: isFeatured,
    },
    next: {
      revalidate: 60,
      tags: [PUBLIC_CACHE_TAGS.blog],
    },
  });

  return {
    ...response,
    data: normalizeBlogPosts(response.data),
  };
}

export async function getBlogPostBySlug(slug: string) {
  const response = await apiFetch<BlogPost>(
    `/api/BlogPosts/by-slug/${encodeURIComponent(slug)}`,
    {
      next: {
        revalidate: 60,
        tags: [PUBLIC_CACHE_TAGS.blog],
      },
    },
  );

  return {
    ...response,
    data: normalizeBlogPost(response.data),
  };
}
