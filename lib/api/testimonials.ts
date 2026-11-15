import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import { apiFetch, createAssetUrl } from "./client";

export type Testimonial = {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  starNumber: number;
  avatar: {
    id: number;
    filePath: string;
  } | null;
  createdAt: string;
  isActive: boolean;
};

export type LandingTestimonial = Testimonial & {
  avatarUrl: string | null;
};

type GetTestimonialsParams = {
  pageSize?: number;
  pageNumber?: number;
  isActive?: boolean;
};

export async function getTestimonials({
  pageSize = 10,
  pageNumber = 1,
  isActive = true,
}: GetTestimonialsParams = {}) {
  const response = await apiFetch<Testimonial[]>("/api/Testimonials/get-all", {
    query: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      IsActive: isActive,
    },
    next: {
      revalidate: 60,
      tags: [PUBLIC_CACHE_TAGS.testimonials],
    },
  });

  return {
    ...response,
    data: response.data
      .slice()
      .filter((testimonial) => testimonial.isActive)
      .sort((first, second) => first.id - second.id)
      .map((testimonial) => ({
        ...testimonial,
        avatarUrl: createAssetUrl(testimonial.avatar?.filePath),
      })),
  };
}
