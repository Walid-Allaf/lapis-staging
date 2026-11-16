import "server-only";
import { publicApiResponse } from "@/server/integration/public-transport";

type QueryValue = string | number | boolean | null | undefined;

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  query?: Record<string, QueryValue>;
  next?: NextFetchRequestConfig;
};

export type ApiResponse<T> = {
  isSuccess: boolean;
  data: T;
  error: string | null;
  paging?: {
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
  };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function getApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export function createAssetUrl(filePath: string | null | undefined) {
  if (!filePath) {
    return null;
  }

  // Internal media is served by this application, independently of its build origin.
  if (/^\/?uploads\/[a-f0-9]{32}\.(?:jpg|png|webp|gif|pdf)$/.test(filePath)) {
    return `/${filePath.replace(/^\//, "")}`;
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  return `${getApiBaseUrl()}/${filePath.replace(/^\//, "")}`;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}) {
  const response = await publicApiResponse(path.startsWith("/") ? path : `/${path}`, options);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;

  if (!payload.isSuccess) {
    throw new Error(payload.error ?? "API request was not successful.");
  }

  return payload;
}
