import "server-only";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/dashboard/api/upload-limits";

export class BodyLimitError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// File contents are never accumulated. Keep only a bounded multipart header and
// closing-boundary tail, and count the intervening bytes while forwarding them.
export function boundedRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const multipart = /^multipart\/form-data(?:;|$)/i.test(contentType);
  const boundary = contentType.match(/boundary=(?:"([^"\r\n]+)"|([^;\s\r\n]+))/i)?.slice(1).find(Boolean);
  if (multipart && (!boundary || !/^[A-Za-z0-9'()+_,.\/:=? -]{1,70}$/.test(boundary))) throw new BodyLimitError(400, "حدود ملف الرفع غير صالحة");
  const closing = multipart ? Buffer.from(`\r\n--${boundary}--`) : Buffer.alloc(0);
  const envelopeLimit = multipart ? 8192 + closing.length + 2 : 0;
  const contentLength = request.headers.get("content-length");
  if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_UPLOAD_BYTES + envelopeLimit)) throw new BodyLimitError(413, "حجم الطلب أكبر من الحد المسموح");
  let total = 0, fileBytes = 0, header = Buffer.alloc(0), tail = Buffer.alloc(0), inBody = !multipart;
  let failure: BodyLimitError | null = null;
  function fail(status: number, message: string): never { failure = new BodyLimitError(status, message); throw failure; }
  function countData(chunk: Buffer) {
    const data = Buffer.concat([tail, chunk]);
    const retained = multipart ? Math.min(data.length, closing.length + 2) : 0;
    fileBytes += data.length - retained;
    tail = data.subarray(data.length - retained);
    if (fileBytes > MAX_UPLOAD_BYTES) fail(413, `حجم الملف أكبر من ${MAX_UPLOAD_MB}MB`);
  }
  const body = request.body?.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      total += chunk.byteLength;
      if (total > MAX_UPLOAD_BYTES + envelopeLimit) fail(413, "حجم الطلب أكبر من الحد المسموح");
      if (!inBody) {
        header = Buffer.concat([header, Buffer.from(chunk)]);
        const end = header.indexOf("\r\n\r\n");
        if (end < 0) { if (header.length > 8192) fail(400, "ترويسة الملف غير صالحة"); }
        else {
          if (end + 4 > 8192 || !header.subarray(0, end).toString().startsWith(`--${boundary}\r\n`)) fail(400, "ترويسة الملف غير صالحة");
          inBody = true;
          countData(header.subarray(end + 4));
          header = Buffer.alloc(0);
        }
      } else countData(Buffer.from(chunk));
      controller.enqueue(chunk);
    },
    flush() {
      if (multipart) {
        if (!inBody) fail(400, "طلب رفع غير مكتمل");
        const ending = tail.subarray(tail.length - 2).equals(Buffer.from("\r\n")) ? tail.subarray(0, -2) : tail;
        if (!ending.subarray(ending.length - closing.length).equals(closing)) fail(400, "طلب رفع غير مكتمل");
        fileBytes += ending.length - closing.length;
        if (fileBytes > MAX_UPLOAD_BYTES) fail(413, `حجم الملف أكبر من ${MAX_UPLOAD_MB}MB`);
      }
    },
  }));
  return { body, getFailure: () => failure };
}
