import "server-only";
import { FileError, invalidFile, MAX_FILE_BYTES, MAX_MULTIPART_BYTES, tooLarge } from "./errors";

export interface UploadPart { originalName: string; mimeType: string; byteLength: number }

// Deliberately one part: no fields, secondary file, preamble or epilogue. Never buffer a whole request.
export async function receiveMultipart(request: Request, write: (chunk: Buffer) => Promise<void>): Promise<UploadPart> {
  const type = request.headers.get("content-type") ?? "";
  const match = /^multipart\/form-data\s*;\s*boundary=(?:"([A-Za-z0-9'()+_,./:=? -]{1,70})"|([A-Za-z0-9'()+_,./:=?-]{1,70}))\s*$/i.exec(type);
  if (!match) throw new FileError(415, "FILE_MULTIPART_REQUIRED", "A multipart/form-data file is required.");
  const boundary = match[1] ?? match[2];
  if (boundary.endsWith(" ")) throw invalidFile();
  const length = request.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || !Number.isSafeInteger(Number(length)))) throw invalidFile();
  if (length !== null && Number(length) > MAX_MULTIPART_BYTES) throw tooLarge();
  const reader = request.body?.getReader();
  if (!reader) throw invalidFile();
  const delimiter = Buffer.from(`\r\n--${boundary}`);
  let pending = Buffer.alloc(0), total = 0, fileBytes = 0, parsed: Omit<UploadPart, "byteLength"> | undefined, finished = false;
  const emit = async (bytes: Buffer) => {
    fileBytes += bytes.length;
    if (fileBytes > MAX_FILE_BYTES) throw tooLarge();
    if (bytes.length) await write(bytes);
  };
  try {
    while (true) {
      if (request.signal.aborted) throw invalidFile();
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_MULTIPART_BYTES) throw tooLarge();
      // Split oversized transport chunks so the parser retains only a bounded header/tail.
      for (let offset = 0; offset < value.length; offset += 8192) {
        const bytes = Buffer.from(value.subarray(offset, offset + 8192));
        pending = Buffer.concat([pending, bytes]);
        if (!parsed) {
          const end = pending.indexOf("\r\n\r\n");
          if (end < 0) { if (pending.length > 8192) throw invalidFile(); continue; }
          if (end + 4 > 8192) throw invalidFile();
          const header = pending.subarray(0, end).toString("utf8");
          const lines = header.split("\r\n");
          if (lines.shift() !== `--${boundary}` || lines.length !== 2) throw invalidFile();
          const headers = new Map<string, string>();
          for (const line of lines) {
            const h = /^([A-Za-z-]+):[ \t]*([^\r\n]+)$/.exec(line);
            if (!h || headers.has(h[1].toLowerCase())) throw invalidFile();
            headers.set(h[1].toLowerCase(), h[2]);
          }
          const disposition = /^form-data;\s*name="file";\s*filename="([^"\r\n\x00-\x1f\x7f]{1,1024})"$/i.exec(headers.get("content-disposition") ?? "");
          const mimeType = (headers.get("content-type") ?? "").trim().toLowerCase();
          if (!disposition || !/^[a-z]+\/[a-z0-9.+-]+$/.test(mimeType)) throw invalidFile();
          // OriginalName is informational only and never participates in any path/header.
          const originalName = disposition[1].replace(/\\/g, "/").split("/").pop()!;
          if (!originalName || originalName === "." || originalName === "..") throw invalidFile();
          parsed = { originalName, mimeType };
          pending = pending.subarray(end + 4);
        }
        if (finished) { if (pending.length > 2 || !Buffer.from("\r\n").subarray(0, pending.length).equals(pending)) throw invalidFile(); continue; }
        const end = pending.indexOf(delimiter);
        if (end >= 0) {
          if (pending.length < end + delimiter.length + 2) {
            await emit(pending.subarray(0, end)); pending = pending.subarray(end); continue;
          }
          if (pending.subarray(end + delimiter.length, end + delimiter.length + 2).toString() !== "--") throw invalidFile();
          await emit(pending.subarray(0, end));
          pending = pending.subarray(end + delimiter.length + 2);
          finished = true;
          if (pending.length > 2 || !Buffer.from("\r\n").subarray(0, pending.length).equals(pending)) throw invalidFile();
        } else {
          const safe = Math.max(0, pending.length - delimiter.length - 2);
          await emit(pending.subarray(0, safe)); pending = pending.subarray(safe);
        }
      }
    }
    if (!parsed || !finished || !fileBytes || (pending.length !== 0 && !pending.equals(Buffer.from("\r\n"))) || (length !== null && Number(length) !== total)) throw invalidFile();
    return { ...parsed, byteLength: fileBytes };
  } catch (error) {
    try { await reader.cancel(); } catch { /* Preserve the sanitized original failure. */ }
    if (error instanceof FileError) throw error;
    throw invalidFile();
  } finally { reader.releaseLock(); }
}
