import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import { apiFetch, createAssetUrl } from "./client";

export type Gallery = {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  beforeImage: {
    id: number;
    filePath: string;
  } | null;
  afterImage: {
    id: number;
    filePath: string;
  } | null;
  createdAt: string;
  isActive: boolean;
};

export type LandingGallery = Gallery & {
  afterImageUrl: string | null;
  beforeImageUrl: string | null;
};

type GetGalleriesParams = {
  pageSize?: number;
  pageNumber?: number;
  isActive?: boolean;
};

function normalizeGalleries(galleries: Gallery[]) {
  return galleries
    .slice()
    .filter(
      (gallery) =>
        gallery.isActive &&
        gallery.titleEn.trim() &&
        gallery.titleAr.trim() &&
        gallery.beforeImage?.filePath &&
        gallery.afterImage?.filePath,
    )
    .sort((first, second) => first.id - second.id)
    .map((gallery) => ({
      ...gallery,
      afterImageUrl: createAssetUrl(gallery.afterImage?.filePath),
      beforeImageUrl: createAssetUrl(gallery.beforeImage?.filePath),
    }));
}

export async function getGalleries({
  pageSize = 100,
  pageNumber = 1,
  isActive = true,
}: GetGalleriesParams = {}) {
  const response = await apiFetch<Gallery[]>("/api/Galleries/get-all", {
    query: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      IsActive: isActive,
    },
    next: {
      revalidate: 60,
      tags: [PUBLIC_CACHE_TAGS.gallery],
    },
  });

  return {
    ...response,
    data: normalizeGalleries(response.data),
  };
}
