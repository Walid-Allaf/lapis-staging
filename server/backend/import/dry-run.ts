import "server-only";
import { resources } from "../modules/content/definitions";

type Row = Record<string, unknown>;
const object = (value: unknown): value is Row => Boolean(value && typeof value === "object" && !Array.isArray(value));
const validId = (id: unknown): id is number => typeof id === "number" && Number.isInteger(id) && id > 0 && id <= 2147483647;
export function analyzeImport(source: unknown) {
  if (!object(source) || source.exportVersion !== 1 || !object(source.modules) || !Array.isArray(source.files)) throw new Error("IMPORT_DOCUMENT_INVALID");
  const issues: Array<{ code: string; module: string; row: number }> = [];
  const issue = (code: string, module: string, row: number) => issues.push({ code, module, row });
  const counts: Record<string, number> = {}, mappings: Record<string, Array<{ legacyId: number; proposedId: number }>> = {};
  const fileIds = new Set<number>(), specialistIds = new Set<number>(), slugs = new Set<string>();
  for (const [index, value] of source.files.entries()) {
    if (!object(value) || !validId(value.id)) { issue("FILE_ID_INVALID", "Files", index); continue; }
    if (fileIds.has(value.id)) issue("DUPLICATE_ID", "Files", index); fileIds.add(value.id);
    if (typeof value.filePath !== "string" || !/^(?:\/?uploads\/[^\s]+|https:\/\/lapis\.runasp\.net\/uploads\/[^\s]+)$/.test(value.filePath)) issue("FILE_SOURCE_PATH_REQUIRES_REVIEW", "Files", index);
    if (typeof value.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(value.sha256) || typeof value.byteLength !== "number" || value.byteLength <= 0 || typeof value.mimeType !== "string") issue("MEDIA_BYTES_HASH_METADATA_UNVERIFIED", "Files", index);
  }
  counts.Files = source.files.length; mappings.Files = [...fileIds].map(id => ({ legacyId: id, proposedId: id }));
  const specialists = source.modules.OurSpecialists;
  if (Array.isArray(specialists)) for (const row of specialists) if (object(row) && validId(row.id)) specialistIds.add(row.id);
  for (const resource of Object.values(resources)) {
    const rows = source.modules[resource.name];
    if (!Array.isArray(rows)) { issue("MODULE_EXPORT_MISSING", resource.name, -1); counts[resource.name] = 0; continue; }
    if (rows.length > 100000) throw new Error("IMPORT_DOCUMENT_TOO_LARGE");
    counts[resource.name] = rows.length; mappings[resource.name] = []; const ids = new Set<number>();
    for (const [index, value] of rows.entries()) {
      if (!object(value) || !validId(value.id)) { issue("ID_INVALID", resource.name, index); continue; }
      if (ids.has(value.id)) issue("DUPLICATE_ID", resource.name, index); ids.add(value.id);
      mappings[resource.name].push({ legacyId: value.id, proposedId: value.id });
      const body: Row = {};
      for (const field of resource.fields) {
        if (field.reference === "file") {
          const image = value[field.image!], reference = object(image) ? image.id : value[field.property];
          if (reference !== null && reference !== undefined && (!validId(reference) || !fileIds.has(reference))) issue("MISSING_FILE_RELATIONSHIP", resource.name, index);
          body[field.property] = reference ?? null;
        } else if (resource.name === "Testimonials" && field.property === "starNumber") {
          if (value.starNumber !== undefined && value.starsNumber !== undefined && value.starNumber !== value.starsNumber) issue("RATING_ALIAS_CONFLICT", resource.name, index);
          body.starNumber = value.starsNumber ?? value.starNumber;
        } else body[field.property] = value[field.property];
      }
      if (!resource.create.safeParse(body).success) issue("CANONICAL_FIELD_TYPE_INVALID", resource.name, index);
      if (typeof value.isActive !== "boolean") issue("SOURCE_ACTIVE_FLAG_UNRESOLVED", resource.name, index);
      if (typeof value.createdAt !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,7})?$/.test(value.createdAt)) issue("SOURCE_DATE_REQUIRES_REVIEW", resource.name, index);
      if (resource.name === "BlogPosts") {
        if (typeof value.slug !== "string" || !value.slug) issue("SLUG_MISSING", resource.name, index);
        else { if (slugs.has(value.slug)) issue("DUPLICATE_SLUG", resource.name, index); slugs.add(value.slug); }
        if (value.ourSpecialistId !== undefined && value.ourSpecialistId !== null && value.ourSpecialistId !== 0 && !specialistIds.has(value.ourSpecialistId as number)) issue("MISSING_SPECIALIST_RELATIONSHIP", resource.name, index);
        if (typeof value.status !== "number" || ![0, 1, 2].includes(value.status)) issue("SOURCE_STATUS_UNRESOLVED", resource.name, index);
      }
    }
  }
  if (!object(source.settings)) issue("SETTINGS_EXPORT_MISSING", "Setting", -1);
  return { mode: "dry-run", writes: 0, applySupported: false, counts, mappings, issues,
    preservation: "Identity IDs, exact saved slugs, bilingual values, NULLs and FK relationships must be retained; no defaults, slug regeneration or overwrite is authorized.",
    remainingGates: ["Authorized full export, including inactive/protected records", "Validated physical media and hashes", "Empty reviewed target or separately authorized merge plan", "Identity/password import separately approved", "Paired SQL/filesystem backups and count/hash verification"] };
}
