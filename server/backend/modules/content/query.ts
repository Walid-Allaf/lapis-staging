import "server-only";
import { z } from "zod";
import { invalidContent } from "./errors";
import type { ContentFilters, ResourceDefinition } from "./types";

const int32 = z.string().regex(/^-?\d+$/).transform(Number).pipe(z.int32());
const boolean = z.enum(["true", "false"]).transform(value => value === "true");
export function parseContentId(value: string): number { return int32.parse(value); }
export function parseContentFilters(url: string, resource: ResourceDefinition): ContentFilters {
  const canonical = ["PageNumber", "PageSize", "Search", "IsActive", "Sort.Field", "Sort.Descending",
    ...(resource.name === "BlogPosts" ? ["Status", "IsFeatured"] : [])];
  const lookup = new Map(canonical.map(name => [name.toLowerCase(), name]));
  const values: Record<string, string> = {};
  for (const [key, value] of new URL(url).searchParams) {
    const target = lookup.get(key.toLowerCase());
    // Legacy autocomplete perPage/page are intentionally NOT pagination aliases.
    if (!target) continue;
    if (Object.hasOwn(values, target)) throw invalidContent();
    values[target] = value;
  }
  return {
    pageNumber: values.PageNumber === undefined ? 1 : int32.pipe(z.number().min(1)).parse(values.PageNumber),
    pageSize: values.PageSize === undefined ? 10 : int32.pipe(z.number().min(1).max(100)).parse(values.PageSize),
    search: values.Search,
    isActive: values.IsActive === undefined ? undefined : boolean.parse(values.IsActive),
    isFeatured: values.IsFeatured === undefined ? undefined : boolean.parse(values.IsFeatured),
    status: values.Status === undefined ? undefined : int32.pipe(z.number().min(0).max(2)).parse(values.Status),
    sort: values["Sort.Field"] === undefined ? resource.defaultSort : int32.pipe(z.number().min(0).max(resource.sortColumns.length - 1)).parse(values["Sort.Field"]),
    descending: values["Sort.Descending"] === undefined ? false : boolean.parse(values["Sort.Descending"]),
  };
}
export function stableSlug(title: string, id: number): string {
  const normalized = title.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
  const base = Array.from(normalized).slice(0, 100).join("").replace(/-+$/g, "") || "post";
  return `${base}-${id}`;
}
