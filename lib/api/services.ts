import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache-tags";
import { apiFetch, createAssetUrl } from "./client";

export type Service = {
  id: number;
  nameAr: string;
  nameEn: string;
  simpleDescriptionAr: string;
  simpleDescriptionEn: string;
  descriptionAr: string;
  descriptionEn: string;
  order: number;
  avatar: {
    id: number;
    filePath: string;
  } | null;
  createdAt: string;
  isActive: boolean;
};

export type LandingService = Service & {
  avatarUrl: string | null;
};

type GetServicesParams = {
  pageSize?: number;
  pageNumber?: number;
  isActive?: boolean;
};

function normalizeServices(services: Service[], pageSize?: number) {
  const normalized = services
    .slice()
    .filter((service) => service.isActive)
    .sort((first, second) => first.order - second.order || first.id - second.id)
    .map((service) => ({
      ...service,
      avatarUrl: createAssetUrl(service.avatar?.filePath),
    }));

  return typeof pageSize === "number" ? normalized.slice(0, pageSize) : normalized;
}

export async function getServices({
  pageSize = 3,
  pageNumber = 1,
  isActive = true,
}: GetServicesParams = {}) {
  const response = await apiFetch<Service[]>("/api/Services/get-all", {
    query: {
      PageNumber: pageNumber,
      PageSize: Math.max(pageSize, 10),
      IsActive: isActive,
    },
    next: {
      revalidate: 60,
      tags: [PUBLIC_CACHE_TAGS.services],
    },
  });

  return {
    ...response,
    data: normalizeServices(response.data, pageSize),
  };
}

type GetAllServicesParams = {
  pageSize?: number;
  isActive?: boolean;
};

export async function getAllServices({
  pageSize = 100,
  isActive = true,
}: GetAllServicesParams = {}) {
  const firstResponse = await apiFetch<Service[]>("/api/Services/get-all", {
    query: {
      PageNumber: 1,
      PageSize: pageSize,
      IsActive: isActive,
    },
    next: {
      revalidate: 60,
      tags: [PUBLIC_CACHE_TAGS.services],
    },
  });

  const totalRecords = firstResponse.paging?.totalRecords ?? firstResponse.data.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const remainingResponses =
    totalPages > 1
      ? await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            apiFetch<Service[]>("/api/Services/get-all", {
              query: {
                PageNumber: index + 2,
                PageSize: pageSize,
                IsActive: isActive,
              },
              next: {
                revalidate: 60,
                tags: [PUBLIC_CACHE_TAGS.services],
              },
            }),
          ),
        )
      : [];

  return {
    ...firstResponse,
    data: normalizeServices([
      ...firstResponse.data,
      ...remainingResponses.flatMap((response) => response.data),
    ]),
  };
}
