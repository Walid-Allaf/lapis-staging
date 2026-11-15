import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import { apiFetch } from "./client";

export type YouTubeGallery = {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  videoUrl: string;
  createdAt: string;
  isActive: boolean;
};

type GetYouTubeGalleriesParams = {
  pageSize?: number;
  pageNumber?: number;
  isActive?: boolean;
};

function normalizeYouTubeGalleries(videos: YouTubeGallery[]) {
  return videos
    .slice()
    .filter(
      (video) =>
        video.isActive &&
        video.videoUrl.trim() &&
        video.titleAr.trim() &&
        video.titleEn.trim(),
    )
    .sort((first, second) => first.id - second.id);
}

export async function getYouTubeGalleries({
  pageSize = 100,
  pageNumber = 1,
  isActive = true,
}: GetYouTubeGalleriesParams = {}) {
  const response = await apiFetch<YouTubeGallery[]>("/api/YouTubeGalleries/get-all", {
    query: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      IsActive: isActive,
    },
    next: {
      revalidate: 60,
      tags: [PUBLIC_CACHE_TAGS.youtube],
    },
  });

  return {
    ...response,
    data: normalizeYouTubeGalleries(response.data),
  };
}
