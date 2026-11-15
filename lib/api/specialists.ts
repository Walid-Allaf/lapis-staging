import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import { apiFetch, createAssetUrl } from "./client";

export type Specialist = {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  specialistAr: string;
  specialistEn: string;
  image: {
    id: number;
    filePath: string;
  } | null;
  createdAt: string;
  isActive: boolean;
};

export type LandingSpecialist = Specialist & {
  imageUrl: string | null;
};

type GetSpecialistsParams = {
  pageSize?: number;
  pageNumber?: number;
  isActive?: boolean;
};

export async function getSpecialists({
  pageSize = 10,
  pageNumber = 1,
  isActive = true,
}: GetSpecialistsParams = {}) {
  const response = await apiFetch<Specialist[]>("/api/OurSpecialists/get-all", {
    query: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      IsActive: isActive,
    },
    next: {
      revalidate: 60,
      tags: [PUBLIC_CACHE_TAGS.specialists],
    },
  });

  return {
    ...response,
    data: response.data
      .slice()
      .filter((specialist) => specialist.isActive)
      .sort((first, second) => first.id - second.id)
      .map((specialist) => ({
        ...specialist,
        imageUrl: createAssetUrl(specialist.image?.filePath),
      })),
  };
}
