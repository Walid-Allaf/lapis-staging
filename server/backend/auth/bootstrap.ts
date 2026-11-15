import "server-only";
import type sql from "mssql";
import { assertDatabaseWriteAllowed, type Environment } from "../config";
import { verifyWriteTarget } from "../db/write-target";
import { migrationStatus } from "../db/migration-history";
import { loadMigrations } from "../db/migration-catalog";
import { query } from "../db/parameters";
import { hashPassword } from "./password";
import { AuthError, forbidden } from "./errors";
import { usableAccount } from "./authorize";
import { authTransaction, byEmail, ensureRole, insertUser, event } from "../modules/auth/repository";
import { z } from "zod";
import { acquireApplicationLock } from "../db/lock";
import { assertProductionMaintenance, verifyProductionMaintenance } from "../db/production-maintenance";

export async function bootstrapAdministrator(pool: sql.ConnectionPool, input: { email: string; password: string }, env: Environment = process.env): Promise<{ applied: boolean }> {
  const production = env.SQL_ENV === "production";
  if (production) assertProductionMaintenance("bootstrap", env);
  else {
    assertDatabaseWriteAllowed("seed", env);
    if (env.NODE_ENV === "production") throw forbidden();
    await verifyWriteTarget(pool, "seed", env);
  }
  if (env.AUTH_BOOTSTRAP_ALLOW !== "true" || env.AUTH_BOOTSTRAP_CONFIRM !== "CREATE_FIRST_SUPERADMIN") throw forbidden();
  z.email().parse(input.email);
  const hash = await hashPassword(input.password);
  return authTransaction(pool, async transaction => {
    await acquireApplicationLock(transaction, "LAPiS:foundation:migrations");
    if (production) await verifyProductionMaintenance(transaction, "bootstrap", env);
    if ((await migrationStatus(transaction, await loadMigrations())).state !== "current") throw new AuthError(409, "AUTH_SCHEMA_NOT_CURRENT", "Database schema is not current.");
    const existing = await byEmail(transaction, input.email);
    if (existing) {
      if (existing.RoleCode === "superadmin" && usableAccount(existing)) return { applied: false };
      throw new AuthError(409, "AUTH_BOOTSTRAP_CONFLICT", "Bootstrap requires an unused identity.");
    }
    const count = (await query<{ count: number }>(transaction, "SELECT COUNT(*) AS count FROM dbo.Users u JOIN dbo.Roles r ON r.RoleId=u.RoleId WHERE r.Code=N'superadmin';")).recordset[0].count;
    if (count) throw new AuthError(409, "AUTH_BOOTSTRAP_COMPLETE", "An administrator is already provisioned.");
    if ((await query<{ count: number }>(transaction, "SELECT COUNT(*) AS count FROM dbo.SecurityEvents WHERE EventType=N'AdminBootstrap';")).recordset[0].count) throw new AuthError(409, "AUTH_BOOTSTRAP_COMPLETE", "Bootstrap has already been used.");
    const user = await insertUser(transaction, { email: input.email, passwordHash: hash, firstName: "Operator", lastName: "Administrator", phoneNumber: null, country: null }, await ensureRole(transaction, "superadmin", "SuperAdmin"), true);
    await event(transaction, "AdminBootstrap", "allowed", user);
    return { applied: true };
  });
}
