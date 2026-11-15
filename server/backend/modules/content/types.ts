import "server-only";
import type { ZodType } from "zod";

export type ContentValue = string | number | boolean | null;
export type ContentInput = Record<string, ContentValue | undefined>;
export type ContentRow = Record<string, unknown>;
export interface Field {
  property: string;
  column: string;
  kind: "string" | "integer" | "boolean" | "double";
  nullable: boolean;
  reference?: "file" | "specialist";
  image?: string;
}
export type ResourceName = "Services" | "FAQs" | "OurSpecialists" | "Testimonials" | "Galleries" | "YouTubeGalleries" | "BlogPosts";
export interface ResourceDefinition {
  name: ResourceName;
  table: string;
  fields: readonly Field[];
  searchColumns: readonly string[];
  sortColumns: readonly string[];
  defaultSort: number;
  create: ZodType;
  update: ZodType;
}
export interface ContentFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  status?: number;
  sort: number;
  descending: boolean;
}
export interface ContentResult {
  data: unknown;
  paging?: { pageNumber: number; pageSize: number; totalRecords: number };
}
