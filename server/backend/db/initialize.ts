import "server-only";
import type sql from "mssql";
import { assertDatabaseWriteAllowed, type Environment } from "../config";
import { verifyWriteTarget } from "./write-target";
import { authTransaction, text, event } from "../modules/auth/repository";
import { acquireApplicationLock } from "./lock";
import { query } from "./parameters";
import { loadMigrations } from "./migration-catalog";
import { migrationStatus } from "./migration-history";
import { DatabaseError } from "./errors";
import { assertProductionMaintenance, verifyProductionMaintenance } from "./production-maintenance";

export async function initializeCleanDatabase(pool: sql.ConnectionPool, env: Environment = process.env) {
  const production = env.SQL_ENV === "production";
  if (production) assertProductionMaintenance("initialize", env);
  else { assertDatabaseWriteAllowed("seed", env); await verifyWriteTarget(pool, "seed", env); }
  if (env.SQL_CLEAN_START_CONFIRM !== "INITIALIZE_EMPTY_LAPIS") throw new DatabaseError("DB_OPERATION_NOT_ALLOWED");
  return authTransaction(pool, async transaction => {
    await acquireApplicationLock(transaction, "LAPiS:foundation:migrations");
    if (production) await verifyProductionMaintenance(transaction, "initialize", env);
    if ((await migrationStatus(transaction, await loadMigrations())).state !== "current") throw new DatabaseError("DB_MIGRATION_BLOCKED");
    const occupied = (await query<{ n: number }>(transaction, `SELECT
      (SELECT COUNT(*) FROM dbo.Users)+(SELECT COUNT(*) FROM dbo.Files)+(SELECT COUNT(*) FROM dbo.Services)+
      (SELECT COUNT(*) FROM dbo.BlogPosts)+(SELECT COUNT(*) FROM dbo.FAQs)+(SELECT COUNT(*) FROM dbo.Galleries)+
      (SELECT COUNT(*) FROM dbo.OurSpecialists)+(SELECT COUNT(*) FROM dbo.Testimonials)+(SELECT COUNT(*) FROM dbo.YouTubeGalleries)+
      (SELECT COUNT(*) FROM dbo.DevelopmentSeedHistory) AS n;`)).recordset[0].n;
    if (occupied) throw new DatabaseError("DB_OPERATION_NOT_ALLOWED");
    const roleContracts = new Map([["user", "User"], ["manager", "Manager"], ["superadmin", "SuperAdmin"]]);
    const roles = (await query<{ Code: string; ContractValue: string | null; ContractValueKind: string | null }>(transaction,
      "SELECT Code,ContractValue,ContractValueKind FROM dbo.Roles;")).recordset;
    if (roles.some(role => !roleContracts.has(role.Code) || roleContracts.get(role.Code) !== role.ContractValue || role.ContractValueKind !== "string")) throw new DatabaseError("DB_OPERATION_NOT_ALLOWED");
    const initialized = (await query<{ n: number }>(transaction, "SELECT COUNT(*) AS n FROM dbo.SecurityEvents WHERE EventType=N'CleanStartInitialized';")).recordset[0].n;
    // Never overwrite settings, roles or advertisements on an already initialized database.
    if (initialized) return { applied: false };
    const settings = (await query<{ n: number }>(transaction, "SELECT (SELECT COUNT(*) FROM dbo.SiteSettings)+(SELECT COUNT(*) FROM dbo.Ads) AS n;")).recordset[0].n;
    if (settings) throw new DatabaseError("DB_OPERATION_NOT_ALLOWED");
    for (const [code, value] of [["user", "User"], ["manager", "Manager"], ["superadmin", "SuperAdmin"]]) {
      const existing = (await query<{ ContractValue: string; ContractValueKind: string }>(transaction, "SELECT ContractValue,ContractValueKind FROM dbo.Roles WHERE Code=@code;", [text("code", code)])).recordset[0];
      if (existing && (existing.ContractValue !== value || existing.ContractValueKind !== "string")) throw new DatabaseError("DB_OPERATION_NOT_ALLOWED");
      if (!existing) await query(transaction, "INSERT dbo.Roles(Code,ContractValue,ContractValueKind) VALUES(@code,@value,N'string');", [text("code", code), text("value", value)]);
    }
    await query(transaction, `INSERT dbo.SiteSettings(Id,FAQsTabToggle,ServicesTabToggle,GalleriesTabToggle,YouTubeGalleriesTabToggle,TestimonialsTabToggle,OurSpecialistsTabToggle) VALUES(1,0,0,0,0,0,0);
      INSERT dbo.Ads(Id,IsExternal,IsActive) VALUES(1,0,0);`);
    await event(transaction, "CleanStartInitialized", "allowed");
    return { applied: true };
  });
}
