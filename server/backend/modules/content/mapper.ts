import "server-only";
import { ContentError } from "./errors";
import type { ContentRow, ResourceDefinition } from "./types";

// Keep SQL's full DATETIME2 precision. Passing through a JS Date would lose sub-milliseconds.
export function sqlWireDate(column: string): string {
  return `(CONVERT(NVARCHAR(19),${column},126)+N'.'+RIGHT(N'0000000'+CONVERT(NVARCHAR(7),DATEPART(NANOSECOND,${column})/100),7))`;
}
export function contentDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,7})?$/.test(value)) {
    throw new ContentError(503, "CONTENT_DATE_INVALID", "Content is temporarily unavailable.");
  }
  return value.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
}
export function imageDto(row: ContentRow, prefix: string): { id: number; filePath: string } | null {
  const id = row[`${prefix}Id`], filePath = row[`${prefix}Path`];
  return typeof id === "number" && typeof filePath === "string" && filePath.length > 0 ? { id, filePath } : null;
}
export function specialistDto(row: ContentRow, prefix = "") {
  if (typeof row[`${prefix}Id`] !== "number") return null;
  const string = (name: string) => typeof row[`${prefix}${name}`] === "string" ? row[`${prefix}${name}`] as string : "";
  return { id: row[`${prefix}Id`] as number, nameAr: string("NameAr"), nameEn: string("NameEn"),
    descriptionAr: string("DescriptionAr"), descriptionEn: string("DescriptionEn"), specialistAr: string("SpecialistAr"), specialistEn: string("SpecialistEn"),
    image: imageDto(row, `${prefix}Image`), createdAt: contentDate(row[`${prefix}CreatedAtWire`]), isActive: row[`${prefix}IsActive`] === true };
}
export function contentDto(resource: ResourceDefinition, row: ContentRow, administrative: boolean): Record<string, unknown> {
  const dto: Record<string, unknown> = { id: row.Id, createdAt: contentDate(row.CreatedAtWire), isActive: row.IsActive === true };
  for (const field of resource.fields) {
    if (field.property === "isActive") continue;
    if (field.reference === "file") {
      dto[field.image!] = imageDto(row, field.column);
      continue;
    }
    const raw = row[field.column];
    dto[field.property] = field.kind === "string" ? typeof raw === "string" ? raw : "" : field.kind === "boolean" ? raw === true : typeof raw === "number" ? raw : 0;
  }
  if (resource.name === "Testimonials") {
    dto.starsNumber = dto.starNumber;
    // One explicit additive response alias, required by unchanged frontend DTOs.
  }
  if (resource.name === "BlogPosts") {
    dto.slug = typeof row.Slug === "string" ? row.Slug : "";
    dto.updatedAt = contentDate(row.UpdatedAtWire ?? row.CreatedAtWire);
    dto.ourSpecialist = administrative || row.SpecialistIsActive === true ? specialistDto(row, "Specialist") : null;
  }
  return dto;
}
