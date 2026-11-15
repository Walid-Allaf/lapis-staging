import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import { apiFetch } from "./client";

export type FAQ = {
  id: number;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  createdAt: string;
  isActive: boolean;
};

type GetFAQsParams = {
  pageSize?: number;
  pageNumber?: number;
  isActive?: boolean;
};

export async function getFAQs({
  pageSize = 10,
  pageNumber = 1,
  isActive = true,
}: GetFAQsParams = {}) {
  const response = await apiFetch<FAQ[]>("/api/FAQs/get-all", {
    query: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      IsActive: isActive,
    },
    next: {
      revalidate: 60,
      tags: [PUBLIC_CACHE_TAGS.faqs],
    },
  });

  return {
    ...response,
    data: response.data
      .slice()
      .filter(
        (faq) =>
          faq.isActive &&
          faq.questionEn.trim() &&
          faq.questionAr.trim() &&
          faq.answerEn.trim() &&
          faq.answerAr.trim(),
      )
      .sort((first, second) => first.id - second.id),
  };
}
