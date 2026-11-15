import "server-only";
import { readAuthConfig } from "../backend/auth/config";
import { authorize } from "../backend/auth/authorize";
import { verifyIdentity, hashTokenId } from "../backend/auth/jwt";
import { AuthError, forbidden } from "../backend/auth/errors";
import { getPool } from "../backend/db/pool";
import { query } from "../backend/db/parameters";
import { authTransaction, binary, userKey, event } from "../backend/modules/auth/repository";
import { isContentAdministrator } from "../backend/modules/content/service";

export async function verifyDashboardToken(token: string | undefined) {
  if (!token || Buffer.byteLength(token) > 3500) return null;
  const config = readAuthConfig();
  try {
    const identity = await verifyIdentity(config, token);
    return await authTransaction(await getPool(), async transaction => {
      const actor = await authorize(transaction, config, token);
      if (!isContentAdministrator(actor)) throw forbidden();
      return { token, session: { user: { id: actor.ExternalId, email: actor.Email!, role: identity.role }, expiresOn: new Date(identity.exp * 1000).toISOString() } };
    });
  } catch (error) { if (error instanceof AuthError && [401, 403].includes(error.status)) return null; throw error; }
}
export async function revokeDashboardToken(token: string | undefined) {
  if (!token || Buffer.byteLength(token) > 3500) return;
  const config = readAuthConfig();
  try {
    const identity = await verifyIdentity(config, token);
    await authTransaction(await getPool(), async transaction => {
      const actor = await authorize(transaction, config, token);
      await query(transaction, "UPDATE dbo.AuthSessions SET RevokedAtUtc=SYSUTCDATETIME() WHERE UserKey=@userKey AND JtiHash=@hash AND RevokedAtUtc IS NULL;", [userKey(actor.UserKey), binary("hash", hashTokenId(identity.jti))]);
      await event(transaction, "DashboardLogout", "allowed", actor);
    });
  } catch (error) { if (error instanceof AuthError && [401, 403].includes(error.status)) return; throw error; }
}
