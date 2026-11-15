import "server-only";
import sql from "mssql";
import { withTransaction } from "../../db/transaction";
import { query } from "../../db/parameters";
import { DatabaseError } from "../../db/errors";
import { acquireApplicationLock } from "../../db/lock";
import { authorize, roleValue } from "../../auth/authorize";
import { readAuthConfig, type AuthConfig } from "../../auth/config";
import { AuthError, forbidden, invalidCredentials } from "../../auth/errors";
import { event, type UserRow } from "../auth/repository";
import { ContentError, conflictingContent, invalidContent, missingContent } from "./errors";
import { resources, adsFields, settingFields } from "./definitions";
import { AdsUpdate, SettingUpdate } from "./validation";
import { contentDto, imageDto } from "./mapper";
import { stableSlug } from "./query";
import { createValues, fieldParameter, insertResource, intParameter, listResource, readResource, safeTotal, textParameter, updateResource, validateReferences } from "./repository";
import type { ContentFilters, ContentInput, ContentResult, ContentRow, Field, ResourceDefinition } from "./types";

export function isContentAdministrator(user: UserRow | undefined): boolean {
  return Boolean(user && ((user.RoleCode === "superadmin" && roleValue(user) === "SuperAdmin") || (user.RoleCode === "manager" && roleValue(user) === "Manager")));
}
export class ContentService {
  constructor(private readonly pool: sql.ConnectionPool, private readonly configuration: () => AuthConfig = readAuthConfig) {}

  private async transaction<T>(token: string | undefined, write: boolean, administrativeOnly: boolean,
    work: (transaction: sql.Transaction, administrative: boolean, actor?: UserRow) => Promise<T>): Promise<T> {
    if (administrativeOnly && !token) throw invalidCredentials();
    let domain: AuthError | ContentError | undefined;
    try {
      return await withTransaction(this.pool, async transaction => {
        try {
          let actor: UserRow | undefined;
          if (token) {
            // Same ordering as Phase 3: a disable/password change cannot race a protected mutation.
            await acquireApplicationLock(transaction, "LAPiS:auth:state", 5000);
            actor = await authorize(transaction, this.configuration(), token);
          }
          const administrative = isContentAdministrator(actor);
          if (administrativeOnly && !administrative) throw forbidden();
          const lock = await query<{ result: number }>(transaction, `DECLARE @result INT;
            EXEC @result=sys.sp_getapplock @Resource=N'LAPiS:content:state',@LockMode=@mode,@LockOwner='Transaction',@LockTimeout=5000,@DbPrincipal='public';
            SELECT @result AS result;`, [{ name: "mode", type: sql.NVarChar(20), value: write ? "Exclusive" : "Shared" }]);
          if (!lock.recordset[0] || lock.recordset[0].result < 0) throw new DatabaseError("DB_LOCK_UNAVAILABLE");
          return await work(transaction, administrative, actor);
        } catch (error) {
          if (error instanceof AuthError || error instanceof ContentError) domain = error;
          throw error instanceof DatabaseError ? error : new DatabaseError("DB_TRANSACTION_FAILED");
        }
      }, sql.ISOLATION_LEVEL.SERIALIZABLE);
    } catch (error) { if (domain) throw domain; throw error; }
  }
  async list(resource: ResourceDefinition, filters: ContentFilters, token?: string): Promise<ContentResult> {
    return this.transaction(token, false, false, async (transaction, administrative) => {
      const result = await listResource(transaction, resource, administrative, filters);
      return { data: result.rows.map(row => contentDto(resource, row, administrative)), paging: result.paging };
    });
  }
  async detail(resource: ResourceDefinition, identity: { id: number } | { slug: string }, token?: string): Promise<ContentResult> {
    return this.transaction(token, false, false, async (transaction, administrative) => {
      const row = await readResource(transaction, resource, administrative, identity);
      if (!row) throw missingContent();
      return { data: contentDto(resource, row, administrative) };
    });
  }
  async create(resource: ResourceDefinition, body: unknown, token?: string): Promise<ContentResult> {
    const input = resource.create.parse(body) as ContentInput;
    return this.transaction(token, true, true, async (transaction, _administrative, actor) => {
      const values = createValues(resource, input);
      await validateReferences(transaction, resource.fields, values);
      const id = await insertResource(transaction, resource, values);
      if (resource.name === "BlogPosts") {
        const base = stableSlug(String(values.titleEn || values.titleAr || ""), id);
        let slug = base;
        for (let suffix = 2; suffix <= 33; suffix++) {
          const existing = (await query<{ present: number }>(transaction, "SELECT 1 AS present FROM dbo.BlogPosts WHERE SlugHash=HASHBYTES('SHA2_256',CONVERT(VARBINARY(MAX),@slug));", [textParameter("slug", slug)])).recordset[0];
          if (!existing) break;
          if (suffix === 33) throw new ContentError(409, "CONTENT_SLUG_CONFLICT", "A unique slug could not be assigned.");
          slug = `${base}-${suffix}`;
        }
        await query(transaction, "UPDATE dbo.BlogPosts SET Slug=@slug WHERE Id=@id;", [textParameter("slug", slug), intParameter("id", id)]);
      }
      await event(transaction, `Content:${resource.name}:add`, "allowed", actor);
      return { data: contentDto(resource, (await readResource(transaction, resource, true, { id }))!, true) };
    });
  }
  async update(resource: ResourceDefinition, id: number, body: unknown, token?: string): Promise<ContentResult> {
    const input = resource.update.parse(body) as ContentInput;
    if (input.id !== undefined && input.id !== id) throw invalidContent();
    if (resource.name === "Testimonials" && input.starsNumber !== undefined) {
      if (input.starNumber !== undefined && input.starNumber !== input.starsNumber) throw invalidContent();
      input.starNumber = input.starsNumber;
    }
    return this.transaction(token, true, true, async (transaction, _administrative, actor) => {
      if (!await readResource(transaction, resource, true, { id })) throw missingContent();
      await validateReferences(transaction, resource.fields, input);
      await updateResource(transaction, resource, id, input);
      await event(transaction, `Content:${resource.name}:edit`, "allowed", actor);
      return { data: contentDto(resource, (await readResource(transaction, resource, true, { id }))!, true) };
    });
  }
  async remove(resource: ResourceDefinition, id: number, token?: string): Promise<ContentResult> {
    return this.transaction(token, true, true, async (transaction, _administrative, actor) => {
      if (!await readResource(transaction, resource, true, { id })) throw missingContent();
      if (resource.name === "OurSpecialists" && (await query<{ present: number }>(transaction, "SELECT TOP(1) 1 AS present FROM dbo.BlogPosts WHERE OurSpecialistId=@id;", [intParameter("id", id)])).recordset[0]) throw conflictingContent();
      await query(transaction, `DELETE FROM dbo.[${resource.table}] WHERE Id=@id;`, [intParameter("id", id)]);
      await event(transaction, `Content:${resource.name}:delete`, "allowed", actor);
      return { data: null };
    });
  }
  async getSettings(token?: string, publicProjection = false): Promise<ContentResult> {
    return this.transaction(token, false, !publicProjection, async transaction => {
      const row = (await query<ContentRow>(transaction, `SELECT ${settingFields.map(field => `[${field.column}]`).join(",")} FROM dbo.SiteSettings WHERE Id=1;`)).recordset[0];
      if (!row) throw missingContent();
      return { data: settingsDto(row) };
    });
  }
  async editSettings(body: unknown, token?: string): Promise<ContentResult> {
    const input = SettingUpdate.parse(body) as ContentInput;
    return this.transaction(token, true, true, async (transaction, _administrative, actor) => {
      await query(transaction, `IF NOT EXISTS(SELECT 1 FROM dbo.SiteSettings WHERE Id=1)
        INSERT INTO dbo.SiteSettings(Id,FAQsTabToggle,ServicesTabToggle,GalleriesTabToggle,YouTubeGalleriesTabToggle,TestimonialsTabToggle,OurSpecialistsTabToggle)
        VALUES(1,0,0,0,0,0,0);`);
      await updateSingleton(transaction, "SiteSettings", settingFields, input);
      await event(transaction, "Content:Setting:edit", "allowed", actor);
      const row = (await query<ContentRow>(transaction, `SELECT ${settingFields.map(field => `[${field.column}]`).join(",")} FROM dbo.SiteSettings WHERE Id=1;`)).recordset[0];
      return { data: settingsDto(row) };
    });
  }
  async getAds(token?: string, publicProjection = false): Promise<ContentResult> {
    return this.transaction(token, false, !publicProjection, async transaction => {
      const row = (await query<ContentRow>(transaction, `SELECT a.Text,a.Url,a.IsExternal,a.FileId,a.IsActive,f.Id AS AdFileId,f.PublicPath AS AdFilePath
        FROM dbo.Ads a LEFT JOIN dbo.Files f ON f.Id=a.FileId AND f.StorageState=N'ready' WHERE a.Id=1;`)).recordset[0];
      if (!row) throw missingContent();
      return { data: publicProjection ? clientAdsDto(row) : adsDto(row) };
    });
  }
  async editAds(body: unknown, token?: string): Promise<ContentResult> {
    const input = AdsUpdate.parse(body) as ContentInput;
    return this.transaction(token, true, true, async (transaction, _administrative, actor) => {
      await validateReferences(transaction, adsFields, input);
      await query(transaction, "IF NOT EXISTS(SELECT 1 FROM dbo.Ads WHERE Id=1) INSERT INTO dbo.Ads(Id,IsExternal,IsActive) VALUES(1,0,0);");
      await updateSingleton(transaction, "Ads", adsFields, input);
      await event(transaction, "Content:Ads:edit", "allowed", actor);
      const row = (await query<ContentRow>(transaction, `SELECT a.Text,a.Url,a.IsExternal,a.FileId,a.IsActive,f.Id AS AdFileId,f.PublicPath AS AdFilePath
        FROM dbo.Ads a LEFT JOIN dbo.Files f ON f.Id=a.FileId AND f.StorageState=N'ready' WHERE a.Id=1;`)).recordset[0];
      return { data: adsDto(row) };
    });
  }
  async statistics(token?: string): Promise<ContentResult> {
    return this.transaction(token, false, true, async transaction => {
      // Explicit new content-only metrics. No undocumented user/account statistics.
      const selects = Object.values(resources).map(resource => `SELECT N'${resource.name}' AS resource,CONVERT(VARCHAR(20),COUNT_BIG(*)) AS total,
        CONVERT(VARCHAR(20),COUNT_BIG(CASE WHEN IsActive=1 THEN 1 END)) AS active FROM dbo.[${resource.table}]`);
      const rows = (await query<{ resource: string; total: string; active: string }>(transaction, selects.join(" UNION ALL "))).recordset;
      return { data: Object.fromEntries(rows.map(row => [row.resource, { total: safeTotal(row.total), active: safeTotal(row.active) }])) };
    });
  }
}
async function updateSingleton(transaction: sql.Transaction, table: "Ads" | "SiteSettings", fields: readonly Field[], input: ContentInput): Promise<void> {
  const changed = fields.filter(field => input[field.property] !== undefined);
  if (!changed.length) return;
  await query(transaction, `UPDATE dbo.[${table}] SET ${changed.map(field => `[${field.column}]=@${field.property}`).join(",")},UpdatedAtUtc=SYSUTCDATETIME() WHERE Id=1;`, changed.map(field => fieldParameter(field, input[field.property])));
}
function settingsDto(row: ContentRow): Record<string, unknown> {
  return Object.fromEntries(settingFields.map(field => [field.property, field.kind === "boolean" ? row[field.column] === true :
    field.kind === "double" ? row[field.column] ?? null : typeof row[field.column] === "string" ? row[field.column] : ""]));
}
function clientAdsDto(row: ContentRow) {
  const active = row.IsActive === true;
  return { text: active ? row.Text ?? null : null, url: active ? row.Url ?? null : null, isActive: active };
}
function adsDto(row: ContentRow) {
  return { text: row.Text ?? null, url: row.Url ?? null, isExternal: row.IsExternal === true, fileId: row.FileId ?? null,
    isActive: row.IsActive === true, file: imageDto(row, "AdFile") };
}
