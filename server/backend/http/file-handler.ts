import "server-only";
import { getPool } from "../db/pool";
import { AuthError, invalidCredentials } from "../auth/errors";
import { FileError } from "../modules/files/errors";
import { FileService } from "../modules/files/service";
import { LocalMediaStore, storageKeyPattern } from "../modules/files/storage";

const noStore = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const service = async () => new FileService(await getPool());
export function createUploadHandler(factory: () => Promise<FileService> = service) {
  return async (request: Request): Promise<Response> => {
    try {
      if (request.method !== "POST") throw new FileError(405, "FILE_METHOD", "Method not allowed.");
      const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(request.headers.get("authorization") ?? "");
      if (!match || Buffer.byteLength(match[1]) > 3500) throw invalidCredentials();
      const result = await (await factory()).upload(request, match[1]);
      return Response.json({ isSuccess: true, data: result, error: null, paging: null }, { headers: noStore });
    } catch (error) {
      const safe = error instanceof AuthError || error instanceof FileError ? error : new FileError(503, "FILE_UNAVAILABLE", "File upload is temporarily unavailable.");
      const arabic = request.headers.get("accept-language")?.split(/[,-]/)[0].trim() === "ar";
      const messages: Record<number, string> = { 400: "ملف الرفع مفقود أو غير صالح", 401: "يرجى تسجيل الدخول", 403: "ليس لديك صلاحية رفع الملفات", 409: "تعذر تخصيص ملف جديد، يرجى إعادة المحاولة", 413: "حجم الملف أكبر من 4 MiB", 415: "نوع الملف أو صيغة طلب الرفع غير مدعومة", 503: "رفع الملفات غير متاح مؤقتًا" };
      const message = arabic ? messages[safe.status] ?? safe.publicMessage : safe.publicMessage;
      return Response.json({ isSuccess: false, data: null, error: message, paging: null, message }, { status: safe.status, headers: { ...noStore, ...(safe.status === 405 ? { Allow: "POST" } : {}) } });
    }
  };
}
const missing = () => Response.json({ message: "Media not found." }, { status: 404, headers: noStore });
export function createMediaHandler(factory: () => Promise<FileService> = service, storeFactory = () => new LocalMediaStore()) {
  return async (request: Request, key: string): Promise<Response> => {
    if (!["GET", "HEAD"].includes(request.method)) return new Response(null, { status: 405, headers: { ...noStore, Allow: "GET, HEAD" } });
    if (!storageKeyPattern.test(key)) return missing();
    let file;
    try { file = await (await factory()).readyFile(key); }
    catch { return Response.json({ message: "Media is temporarily unavailable." }, { status: 503, headers: noStore }); }
    if (!file) return missing();
    let handle;
    try { const store = storeFactory(); await store.initialize(); handle = await store.openVerified(file); }
    catch { return missing(); }
    try {
      const stat = await handle.stat(), size = Number(file.ByteLength);
      const etag = '"' + file.Sha256.toString("hex") + '"';
      const headers = new Headers({
        "Content-Type": file.MimeType, "Content-Length": String(size), "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `inline; filename="${file.StorageKey}"`, "Cache-Control": "public, max-age=3600, immutable",
        "ETag": etag, "Last-Modified": stat.mtime.toUTCString(), "Accept-Ranges": "bytes",
        "Content-Security-Policy": "default-src 'none'; sandbox", "Referrer-Policy": "no-referrer",
      });
      const noneMatch = request.headers.get("if-none-match"), modifiedSince = request.headers.get("if-modified-since");
      if ((noneMatch && noneMatch.split(",").some(value => value.trim() === "*" || value.trim().replace(/^W\//, "") === etag)) ||
          (!noneMatch && modifiedSince && Number.isFinite(Date.parse(modifiedSince)) && Math.floor(stat.mtimeMs / 1000) <= Math.floor(Date.parse(modifiedSince) / 1000))) {
        await handle.close(); headers.delete("Content-Length"); return new Response(null, { status: 304, headers });
      }
      let start = 0, end = size - 1, status = 200;
      const range = request.method === "GET" ? request.headers.get("range") : null, ifRange = request.headers.get("if-range");
      const rangeAllowed = !ifRange || ifRange === etag || (Number.isFinite(Date.parse(ifRange)) && Math.floor(stat.mtimeMs / 1000) <= Math.floor(Date.parse(ifRange) / 1000));
      if (range && rangeAllowed) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (match && (match[1] || match[2])) {
          if (!match[1]) { const suffix = Number(match[2]); start = Math.max(0, size - suffix); if (!suffix || !Number.isSafeInteger(suffix)) start = size; }
          else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
        } else start = size;
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
          await handle.close(); return new Response(null, { status: 416, headers: { ...noStore, "Content-Range": `bytes */${size}` } });
        }
        status = 206; headers.set("Content-Range", `bytes ${start}-${end}/${size}`); headers.set("Content-Length", String(end - start + 1));
      }
      if (request.method === "HEAD") { await handle.close(); return new Response(null, { status, headers }); }
      const fd = handle; let position = start, closed = false;
      const close = async () => { if (!closed) { closed = true; request.signal.removeEventListener("abort", abort); await fd.close(); } };
      const abort = () => { void close(); };
      request.signal.addEventListener("abort", abort, { once: true });
      const body = new ReadableStream<Uint8Array>({
        async pull(controller) {
          try {
            if (request.signal.aborted) throw new Error("Media request ended");
            const chunk = Buffer.alloc(Math.min(64 * 1024, end - position + 1));
            const { bytesRead } = await fd.read(chunk, 0, chunk.length, position);
            if (!bytesRead) throw new Error("Media is unavailable");
            controller.enqueue(chunk.subarray(0, bytesRead)); position += bytesRead;
            if (position > end) { await close(); controller.close(); }
          } catch { await close().catch(() => undefined); controller.error(new Error("Media is unavailable")); }
        },
        async cancel() { await close(); },
      });
      return new Response(body, { status, headers });
    } catch { await handle.close().catch(() => undefined); return missing(); }
  };
}
