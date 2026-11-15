import "server-only";
import path from "node:path";
import { constants } from "node:fs";
import { mkdir, lstat, realpath, readdir, opendir, open, link, unlink, type FileHandle } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { FileError, MAX_FILE_BYTES, storageUnavailable } from "./errors";
import { mediaTypes } from "./validation";

export const storageKeyPattern = /^[a-f0-9]{32}\.(?:jpg|png|webp|gif|pdf)$/;
export interface StoredFile { StorageKey: string; ByteLength: number | string; Sha256: Buffer; MimeType: string; PublicPath: string }
export interface Stage { token: string; handle: FileHandle; byteLength: number; hash: ReturnType<typeof createHash> }
const marker = "LAPiS private media storage v1\n";
const inside = (parent: string, child: string) => { const rel = path.relative(parent, child); return rel === "" || (!rel.startsWith(".." + path.sep) && rel !== ".." && !path.isAbsolute(rel)); };
const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === "ENOENT";
const exists = (error: unknown) => (error as NodeJS.ErrnoException).code === "EEXIST";

export function storageRoot(env: Readonly<Record<string, string | undefined>> = process.env, projectRoot = process.cwd()): string {
  const value = env.UPLOAD_DIR;
  if (!value || !path.isAbsolute(value) || /[\x00-\x1f]/.test(value) || value.startsWith("\\\\") || value.startsWith("//") || value.includes(":" + path.sep + path.sep)) throw storageUnavailable();
  const root = path.resolve(value);
  if (root === path.parse(root).root || inside(path.resolve(/*turbopackIgnore: true*/ projectRoot), root) || inside(root, path.resolve(/*turbopackIgnore: true*/ projectRoot))) throw storageUnavailable();
  return root;
}
async function safeAncestors(target: string): Promise<void> {
  const parsed = path.parse(target); let current = parsed.root;
  for (const part of target.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try { const stat = await lstat(current); if (stat.isSymbolicLink() || !stat.isDirectory()) throw storageUnavailable(); }
    catch (error) { if (missing(error)) return; throw error; }
  }
}
export class LocalMediaStore {
  readonly root: string;
  constructor(env: Readonly<Record<string, string | undefined>> = process.env, projectRoot = process.cwd(), private readonly randomToken = () => randomBytes(16).toString("hex")) {
    this.root = storageRoot(env, projectRoot);
  }
  async initialize(create = false): Promise<void> {
    try {
      await safeAncestors(this.root);
      if (create) await mkdir(this.root, { recursive: true, mode: 0o700 });
      if ((await realpath(this.root)).toLowerCase() !== this.root.toLowerCase()) throw storageUnavailable();
      const markerPath = path.join(this.root, ".lapis-media-v1");
      if (create) {
        try {
          const entries = await readdir(this.root);
          if (!entries.includes(".lapis-media-v1") && entries.length) throw storageUnavailable();
          const handle = await open(markerPath, "wx", 0o600);
          try { await handle.writeFile(marker); await handle.sync(); } finally { await handle.close(); }
        } catch (error) { if (!exists(error)) throw error; }
      }
      const mark = await this.openRegular(markerPath);
      try { if ((await mark.readFile("utf8")) !== marker) throw storageUnavailable(); } finally { await mark.close(); }
      for (const name of ["staging", "objects"]) {
        const dir = path.join(/*turbopackIgnore: true*/ this.root, name);
        await safeAncestors(dir);
        if (create) await mkdir(dir, { mode: 0o700 }).catch(error => { if (!exists(error)) throw error; });
        if ((await realpath(/*turbopackIgnore: true*/ dir)).toLowerCase() !== dir.toLowerCase()) throw storageUnavailable();
      }
    } catch { throw storageUnavailable(); }
  }
  private async openRegular(file: string): Promise<FileHandle> {
    await safeAncestors(path.dirname(file));
    const before = await lstat(file);
    if (!before.isFile() || before.isSymbolicLink()) throw storageUnavailable();
    const handle = await open(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    try {
      const actual = await handle.stat(), after = await lstat(file);
      if (!actual.isFile() || after.isSymbolicLink() || actual.dev !== after.dev || actual.ino !== after.ino || before.ino !== after.ino) throw storageUnavailable();
      return handle;
    } catch (error) { await handle.close(); throw error; }
  }
  async begin(): Promise<Stage> {
    await this.initialize(true);
    for (let attempt = 0; attempt < 4; attempt++) {
      const token = this.randomToken();
      if (!/^[a-f0-9]{32}$/.test(token)) throw storageUnavailable();
      const occupied = await Promise.all(Object.values(mediaTypes).map(async extension => {
        try { await lstat(path.join(this.root, "objects", token + "." + extension)); return true; }
        catch (error) { if (missing(error)) return false; throw storageUnavailable(); }
      }));
      if (occupied.some(Boolean)) continue;
      try {
        const handle = await open(path.join(this.root, "staging", token + ".part"), "wx", 0o600);
        return { token, handle, byteLength: 0, hash: createHash("sha256") };
      } catch (error) { if (!exists(error)) throw storageUnavailable(); }
    }
    throw new FileError(409, "FILE_KEY_COLLISION", "A media key could not be allocated. Retry the upload.");
  }
  async write(stage: Stage, chunk: Buffer): Promise<void> {
    if (stage.byteLength + chunk.length > MAX_FILE_BYTES) throw storageUnavailable();
    try { await stage.handle.writeFile(chunk); stage.hash.update(chunk); stage.byteLength += chunk.length; }
    catch { throw storageUnavailable(); }
  }
  async seal(stage: Stage): Promise<Buffer> {
    try { await stage.handle.sync(); }
    catch { throw storageUnavailable(); }
    finally { await stage.handle.close(); }
    const handle = await this.openRegular(path.join(this.root, "staging", stage.token + ".part"));
    try { return await handle.readFile(); } finally { await handle.close(); }
  }
  async abandon(stage: Stage): Promise<void> {
    // Only a stage owned by this request, before metadata registration; never general orphan collection.
    try { await stage.handle.close(); } catch { /* already sealed */ }
    await safeAncestors(path.join(this.root, "staging"));
    await unlink(path.join(this.root, "staging", stage.token + ".part")).catch(error => { if (!missing(error)) throw storageUnavailable(); });
  }
  private paths(key: string) {
    if (!storageKeyPattern.test(key)) throw storageUnavailable();
    return { source: path.join(this.root, "staging", key.slice(0, 32) + ".part"), destination: path.join(this.root, "objects", key) };
  }
  async finalize(file: StoredFile): Promise<void> {
    await this.initialize();
    const { source, destination } = this.paths(file.StorageKey);
    const stage = await this.openVerified(file, true); await stage.close();
    try {
      // Same-volume hard link is exclusive: unlike rename on Windows/Unix it never replaces a destination.
      await link(source, destination);
      const final = await this.openVerified(file); await final.close();
    } catch (error) {
      if (exists(error)) throw new FileError(409, "FILE_KEY_COLLISION", "The media key is already occupied.");
      throw storageUnavailable();
    }
    // Keep the staging link until the ready SQL commit. A crash can be reconciled without deleting bytes.
  }
  async forgetCommittedStage(file: StoredFile): Promise<void> {
    const { source } = this.paths(file.StorageKey);
    await safeAncestors(path.dirname(source));
    await unlink(source).catch(error => { if (!missing(error)) throw storageUnavailable(); });
  }
  async stagingSample(limit = 100): Promise<{ tokens: string[]; truncated: boolean }> {
    await this.initialize();
    const tokens: string[] = []; let entries = 0;
    for await (const entry of await opendir(path.join(this.root, "staging"))) {
      if (++entries > limit) return { tokens, truncated: true };
      if (entry.isFile() && /^[a-f0-9]{32}\.part$/.test(entry.name)) tokens.push(entry.name.slice(0, 32));
    }
    return { tokens, truncated: false };
  }
  async openVerified(file: StoredFile, staging = false): Promise<FileHandle> {
    const { source, destination } = this.paths(file.StorageKey);
    const extension = file.StorageKey.split(".")[1];
    if (!Object.hasOwn(mediaTypes, file.MimeType) || mediaTypes[file.MimeType as keyof typeof mediaTypes] !== extension || file.PublicPath !== "uploads/" + file.StorageKey) throw storageUnavailable();
    const size = Number(file.ByteLength);
    if (!Number.isInteger(size) || size < 1 || size > MAX_FILE_BYTES || !Buffer.isBuffer(file.Sha256) || file.Sha256.length !== 32) throw storageUnavailable();
    const handle = await this.openRegular(staging ? source : destination);
    try {
      const stat = await handle.stat();
      if (stat.size !== size) throw storageUnavailable();
      const hash = createHash("sha256"), buffer = Buffer.alloc(64 * 1024); let offset = 0;
      while (offset < size) { const read = await handle.read(buffer, 0, Math.min(buffer.length, size - offset), offset); if (!read.bytesRead) throw storageUnavailable(); hash.update(buffer.subarray(0, read.bytesRead)); offset += read.bytesRead; }
      if (!hash.digest().equals(file.Sha256)) throw storageUnavailable();
      return handle;
    } catch { await handle.close(); throw storageUnavailable(); }
  }
}
