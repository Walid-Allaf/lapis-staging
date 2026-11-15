import "server-only";
import sql from "mssql";
import { query, type SqlParameter } from "../../db/parameters";
import { ContentError, invalidContent } from "./errors";
import { sqlWireDate } from "./mapper";
import type { ContentFilters, ContentInput, ContentRow, Field, ResourceDefinition } from "./types";

export const intParameter = (name: string, value: number): SqlParameter => ({ name, type: sql.Int(), value });
export const textParameter = (name: string, value: string): SqlParameter => ({ name, type: sql.NVarChar(sql.MAX), value });
export function fieldParameter(field: Field, value: unknown, name = field.property): SqlParameter {
  return { name, value, type: field.kind === "string" ? sql.NVarChar(sql.MAX) : field.kind === "boolean" ? sql.Bit() : field.kind === "double" ? sql.Float() : sql.Int() };
}
export function safeTotal(value: unknown): number {
  const total = Number(value);
  if (!Number.isSafeInteger(total) || total < 0) throw new ContentError(503, "CONTENT_COUNT_INVALID", "Content is temporarily unavailable.");
  return total;
}
export function resourceSelect(resource: ResourceDefinition): { select: string; joins: string } {
  const columns = ["c.Id", ...resource.fields.map(field => `c.[${field.column}]`), `${sqlWireDate("c.CreatedAtUtc")} AS CreatedAtWire`];
  const joins: string[] = [];
  let index = 0;
  for (const field of resource.fields.filter(field => field.reference === "file")) {
    const alias = `f${index++}`;
    joins.push(`LEFT JOIN dbo.Files ${alias} ON ${alias}.Id=c.[${field.column}] AND ${alias}.StorageState=N'ready'`);
    columns.push(`${alias}.Id AS [${field.column}Id]`, `${alias}.PublicPath AS [${field.column}Path]`);
  }
  if (resource.name === "BlogPosts") {
    columns.push("c.Slug", `${sqlWireDate("COALESCE(c.UpdatedAtUtc,c.CreatedAtUtc)")} AS UpdatedAtWire`);
    joins.push("LEFT JOIN dbo.OurSpecialists s ON s.Id=c.OurSpecialistId", "LEFT JOIN dbo.Files sf ON sf.Id=s.FileId AND sf.StorageState=N'ready'");
    columns.push(...["Id", "NameAr", "NameEn", "DescriptionAr", "DescriptionEn", "SpecialistAr", "SpecialistEn", "IsActive"].map(column => `s.[${column}] AS [Specialist${column}]`),
      `${sqlWireDate("s.CreatedAtUtc")} AS SpecialistCreatedAtWire`, "sf.Id AS SpecialistImageId", "sf.PublicPath AS SpecialistImagePath");
  }
  return { select: columns.join(","), joins: joins.join(" ") };
}
function conditions(resource: ResourceDefinition, filters: ContentFilters | undefined, administrative: boolean) {
  const clauses: string[] = [];
  const parameters: SqlParameter[] = [];
  if (!administrative) {
    clauses.push("c.IsActive=1");
    // Only numeric status 0 has been observed in anonymous legacy Blog GETs.
    if (resource.name === "BlogPosts") clauses.push("c.Status=0");
  }
  if (filters?.isActive !== undefined) {
    clauses.push("c.IsActive=@active"); parameters.push({ name: "active", type: sql.Bit(), value: filters.isActive });
  }
  if (filters?.isFeatured !== undefined) {
    clauses.push("c.IsFeatured=@featured"); parameters.push({ name: "featured", type: sql.Bit(), value: filters.isFeatured });
  }
  if (filters?.status !== undefined) {
    clauses.push("c.Status=@status"); parameters.push(intParameter("status", filters.status));
  }
  if (filters?.search) {
    const escaped = filters.search.replace(/[~%_\[]/g, value => `~${value}`);
    clauses.push(`(${resource.searchColumns.map(column => `c.[${column}] LIKE @search ESCAPE N'~'`).join(" OR ")})`);
    parameters.push(textParameter("search", `%${escaped}%`));
  }
  return { clauses, parameters };
}
export async function readResource(transaction: sql.Transaction, resource: ResourceDefinition, administrative: boolean, identity: { id: number } | { slug: string }): Promise<ContentRow | undefined> {
  const { select, joins } = resourceSelect(resource);
  const { clauses, parameters } = conditions(resource, undefined, administrative);
  if ("id" in identity) { clauses.push("c.Id=@id"); parameters.push(intParameter("id", identity.id)); }
  else {
    clauses.push("c.SlugHash=HASHBYTES('SHA2_256',CONVERT(VARBINARY(MAX),@slug))"); parameters.push(textParameter("slug", identity.slug));
  }
  const rows = (await query<ContentRow>(transaction, `SELECT ${select} FROM dbo.[${resource.table}] c ${joins} WHERE ${clauses.join(" AND ")};`, parameters)).recordset;
  if (rows.length > 1 || ("slug" in identity && rows[0] && rows[0].Slug !== identity.slug)) throw new ContentError(503, "CONTENT_SLUG_CONFLICT", "Content is temporarily unavailable.");
  return rows[0];
}
export async function listResource(transaction: sql.Transaction, resource: ResourceDefinition, administrative: boolean, filters: ContentFilters) {
  const { clauses, parameters } = conditions(resource, filters, administrative);
  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const total = safeTotal((await query<{ total: string }>(transaction, `SELECT CONVERT(VARCHAR(20),COUNT_BIG(*)) AS total FROM dbo.[${resource.table}] c${where};`, parameters)).recordset[0].total);
  const column = resource.sortColumns[filters.sort];
  if (!column) throw invalidContent();
  const { select, joins } = resourceSelect(resource);
  const rows = (await query<ContentRow>(transaction, `SELECT ${select} FROM dbo.[${resource.table}] c ${joins}${where}
    ORDER BY c.[${column}] ${filters.descending ? "DESC" : "ASC"}${column === "Id" ? "" : ",c.Id ASC"}
    OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY;`, [...parameters,
    { name: "offset", type: sql.BigInt(), value: (filters.pageNumber - 1) * filters.pageSize }, intParameter("size", filters.pageSize)])).recordset;
  return { rows, paging: { pageNumber: filters.pageNumber, pageSize: filters.pageSize, totalRecords: total } };
}
export async function validateReferences(transaction: sql.Transaction, fields: readonly Field[], input: ContentInput): Promise<void> {
  for (const field of fields.filter(field => field.reference)) {
    const value = input[field.property];
    if (value === undefined || value === null) continue;
    const table = field.reference === "file" ? "Files" : "OurSpecialists";
    const row = (await query<{ Id: number; PublicPath?: string }>(transaction,
      `SELECT Id${table === "Files" ? ",PublicPath" : ""} FROM dbo.[${table}] WHERE Id=@id${table === "Files" ? " AND StorageState=N'ready'" : ""};`, [intParameter("id", value as number)])).recordset[0];
    if (!row || (table === "Files" && !row.PublicPath)) throw new ContentError(400, "CONTENT_INVALID_REFERENCE", "A referenced record is not available.");
  }
}
export function createValues(resource: ResourceDefinition, input: ContentInput): ContentInput {
  return Object.fromEntries(resource.fields.map(field => [field.property, input[field.property] !== undefined ? input[field.property] :
    field.property === "isActive" ? false : field.nullable || field.reference ? null : field.kind === "boolean" ? false : 0]));
}
export async function insertResource(transaction: sql.Transaction, resource: ResourceDefinition, values: ContentInput): Promise<number> {
  const parameters = resource.fields.map(field => fieldParameter(field, values[field.property]));
  const result = await query<{ Id: number }>(transaction, `DECLARE @now DATETIME2(7)=SYSUTCDATETIME();
    INSERT INTO dbo.[${resource.table}](${resource.fields.map(field => `[${field.column}]`).join(",")},CreatedAtUtc,UpdatedAtUtc)
    OUTPUT INSERTED.Id VALUES(${resource.fields.map(field => `@${field.property}`).join(",")},@now,@now);`, parameters);
  return result.recordset[0].Id;
}
export async function updateResource(transaction: sql.Transaction, resource: ResourceDefinition, id: number, input: ContentInput): Promise<void> {
  const fields = resource.fields.filter(field => input[field.property] !== undefined);
  if (!fields.length) return;
  await query(transaction, `UPDATE dbo.[${resource.table}] SET ${fields.map(field => `[${field.column}]=@${field.property}`).join(",")},UpdatedAtUtc=SYSUTCDATETIME() WHERE Id=@id;`,
    [...fields.map(field => fieldParameter(field, input[field.property])), intParameter("id", id)]);
}
