import "server-only";
import sql from "mssql";
import { readAuthConfig, type AuthConfig } from "../../auth/config";
import { authorize } from "../../auth/authorize";
import { AuthError, forbidden, invalidCredentials } from "../../auth/errors";
import { DatabaseError } from "../../db/errors";
import { query } from "../../db/parameters";
import { withTransaction } from "../../db/transaction";
import { acquireApplicationLock } from "../../db/lock";
import { authStateLock, event, text, userKey, integer, type UserRow } from "../auth/repository";
import { isContentAdministrator } from "../content/service";
import { FileError, storageUnavailable } from "./errors";
import { LocalMediaStore, storageKeyPattern, type StoredFile, type Stage } from "./storage";
import { receiveMultipart } from "./multipart";
import { validateMedia } from "./validation";

export interface FileRow extends StoredFile { Id: number; StorageState: string; CreatedAtUtc: Date; CreatedByUserKey: string | null }
const columns = "Id,StorageKey,PublicPath,MimeType,CONVERT(VARCHAR(20),ByteLength) AS ByteLength,Sha256,StorageState,CreatedAtUtc,CONVERT(VARCHAR(20),CreatedByUserKey) AS CreatedByUserKey";
export class FileService {
  constructor(readonly pool: sql.ConnectionPool, private readonly storeFactory = () => new LocalMediaStore(), private readonly configuration: () => AuthConfig = readAuthConfig) {}

  private async transaction<T>(token: string | undefined, key: string | undefined, work: (transaction: sql.Transaction, actor?: UserRow) => Promise<T>): Promise<T> {
    let domain: AuthError | FileError | undefined;
    try {
      return await withTransaction(this.pool, async transaction => {
        try {
          let actor: UserRow | undefined;
          if (token !== undefined) {
            await acquireApplicationLock(transaction, authStateLock, 5000);
            actor = await authorize(transaction, this.configuration(), token);
            if (!isContentAdministrator(actor)) throw forbidden();
          }
          if (key) await acquireApplicationLock(transaction, "LAPiS:media:" + key, 5000);
          return await work(transaction, actor);
        } catch (error) {
          if (error instanceof AuthError || error instanceof FileError) domain = error;
          throw error instanceof DatabaseError ? error : new DatabaseError("DB_TRANSACTION_FAILED");
        }
      });
    } catch (error) { if (domain) throw domain; throw error; }
  }
  async upload(request: Request, token: string): Promise<{ fileId: number; filePath: string }> {
    // Authenticate before touching request bytes or initializing storage. Recheck at both SQL commits.
    if (typeof token !== "string" || !token) throw invalidCredentials();
    await this.transaction(token, undefined, async () => undefined);
    const store = this.storeFactory();
    let stage: Stage | undefined, registrationAttempted = false;
    try {
      stage = await store.begin();
      const part = await receiveMultipart(request, chunk => store.write(stage!, chunk));
      const bytes = await store.seal(stage);
      const format = await validateMedia(bytes, part.mimeType);
      if (part.byteLength !== stage.byteLength || bytes.length !== part.byteLength) throw storageUnavailable();
      const key = stage.token + "." + format.extension;
      const file: StoredFile = { StorageKey: key, PublicPath: "uploads/" + key, ByteLength: part.byteLength, Sha256: stage.hash.digest(), MimeType: format.mimeType };
      registrationAttempted = true;
      const id = await this.transaction(token, key, async (transaction, actor) => {
        if ((await query(transaction, "SELECT Id FROM dbo.Files WITH(UPDLOCK,HOLDLOCK) WHERE StorageKey=@key;", [text("key", key)])).recordset[0]) throw new FileError(409, "FILE_KEY_COLLISION", "The media key is already occupied.");
        return (await query<{ Id: number }>(transaction, `INSERT INTO dbo.Files(StorageKey,PublicPath,OriginalName,MimeType,ByteLength,Sha256,CreatedByUserKey,StorageState)
          OUTPUT INSERTED.Id VALUES(@key,@path,@name,@mime,@bytes,@hash,@userKey,N'pending');`, [text("key", key), text("path", file.PublicPath), text("name", part.originalName), text("mime", file.MimeType),
          { name: "bytes", type: sql.BigInt(), value: part.byteLength }, { name: "hash", type: sql.VarBinary(32), value: file.Sha256 }, userKey(actor!.UserKey)])).recordset[0].Id;
      });
      await this.transaction(token, key, async (transaction, actor) => {
        const row = (await query<FileRow>(transaction, `SELECT ${columns} FROM dbo.Files WITH(UPDLOCK,HOLDLOCK) WHERE Id=@id;`, [integer("id", id)])).recordset[0];
        if (!row || row.StorageState !== "pending" || row.StorageKey !== key || row.CreatedByUserKey !== actor!.UserKey) throw storageUnavailable();
        await store.finalize(row);
        await query(transaction, "UPDATE dbo.Files SET StorageState=N'ready' WHERE Id=@id AND StorageState=N'pending';", [integer("id", id)]);
        await event(transaction, "FileUpload", "allowed", actor);
      });
      // Failure to remove this redundant hard link does not invalidate an already durable ready object.
      await store.forgetCommittedStage(file).catch(() => undefined);
      return { fileId: id, filePath: file.PublicPath };
    } catch (error) {
      if (stage && !registrationAttempted) await store.abandon(stage).catch(() => undefined);
      // After a possibly committed registration keep bytes/pending metadata for explicit recovery.
      if (error instanceof FileError || error instanceof AuthError || error instanceof DatabaseError) throw error;
      throw storageUnavailable();
    }
  }
  async readyFile(key: string): Promise<FileRow | undefined> {
    if (!storageKeyPattern.test(key)) return undefined;
    const row = (await query<FileRow>(this.pool, `SELECT ${columns} FROM dbo.Files WHERE StorageKey=@key AND StorageState=N'ready';`, [text("key", key)])).recordset[0];
    return row?.PublicPath === "uploads/" + key ? row : undefined;
  }
  async recover(options: { afterId?: number; limit?: number; repair?: boolean } = {}) {
    const after = options.afterId ?? 0, limit = options.limit ?? 100;
    if (!Number.isInteger(after) || after < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw storageUnavailable();
    const store = this.storeFactory(); await store.initialize();
    const rows = (await query<FileRow>(this.pool, `SELECT TOP(@limit) ${columns} FROM dbo.Files WHERE Id>@after ORDER BY Id;`, [integer("limit", limit), integer("after", after)])).recordset;
    const results: Array<{ fileId: number; action: string }> = [];
    for (const original of rows) {
      if (!storageKeyPattern.test(original.StorageKey)) { results.push({ fileId: original.Id, action: "legacy-key-requires-import-review" }); continue; }
      results.push(await this.transaction(undefined, original.StorageKey, async transaction => {
        const row = (await query<FileRow>(transaction, `SELECT ${columns} FROM dbo.Files WITH(UPDLOCK,HOLDLOCK) WHERE Id=@id;`, [integer("id", original.Id)])).recordset[0];
        const result = (action: string) => ({ fileId: original.Id, action });
        if (!row || !["pending", "ready"].includes(row.StorageState)) return result("retained-for-review");
        if (row.StorageState === "pending" && Date.now() - row.CreatedAtUtc.getTime() < 60 * 60 * 1000) return result("recent-pending-skipped");
        let finalValid = false, stageValid = false;
        for (const staging of [false, true]) {
          try {
            const handle = await store.openVerified(row, staging);
            try { await validateMedia(await handle.readFile(), row.MimeType); } finally { await handle.close(); }
            if (staging) stageValid = true; else finalValid = true;
          } catch { /* Missing, mismatched or unsafe bytes are never promoted. */ }
        }
        if (row.StorageState === "ready" && finalValid) return result("ready-consistent");
        const promotable = row.StorageState === "pending" && (finalValid || stageValid);
        if (!options.repair) return result(promotable ? "pending-recoverable" : "unavailable-requires-review");
        if (promotable && !finalValid) {
          try { await store.finalize(row); finalValid = true; } catch { finalValid = false; }
        }
        const next = finalValid ? "ready" : "failed";
        await query(transaction, "UPDATE dbo.Files SET StorageState=@state WHERE Id=@id;", [text("state", next), integer("id", row.Id)]);
        // No file or content row is deleted, and failed rows are never automatically retried/promoted.
        return result(next === "ready" ? "promoted-ready" : "withdrawn-failed-retained");
      }));
    }
    const sample = await store.stagingSample(); let unregistered = 0;
    for (const token of sample.tokens) {
      if (!(await query(this.pool, "SELECT TOP(1) Id FROM dbo.Files WHERE StorageKey LIKE @prefix;", [text("prefix", token + ".%")])).recordset[0]) unregistered++;
    }
    return { inspected: results.length, nextAfterId: rows.at(-1)?.Id ?? after, results,
      staging: { sampled: sample.tokens.length, unregisteredRetained: unregistered, truncated: sample.truncated } };
  }
}
