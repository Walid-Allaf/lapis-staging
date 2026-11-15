import "server-only";
import { createInflate } from "node:zlib";
import { FileError, invalidFile, MAX_FILE_BYTES, tooLarge } from "./errors";

export const mediaTypes = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "application/pdf": "pdf" } as const;
export type MediaType = keyof typeof mediaTypes;
const dimensions = (width: number, height: number) => {
  if (!width || !height || width * height > 16_000_000) throw invalidFile();
};
function crc32(bytes: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
async function png(bytes: Buffer) {
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw invalidFile();
  let offset = 8, width = 0, height = 0, bits = 0, channels = 0, interlace = 0, ended = false, palette = false, color = -1;
  const compressed: Buffer[] = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset), end = offset + 12 + length;
    if (end > bytes.length) throw invalidFile();
    const kind = bytes.toString("ascii", offset + 4, offset + 8), data = bytes.subarray(offset + 8, end - 4);
    if (!/^[A-Za-z]{4}$/.test(kind) || crc32(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) throw invalidFile();
    if (offset === 8 && kind !== "IHDR") throw invalidFile();
    if (kind === "IHDR") {
      if (offset !== 8 || length !== 13) throw invalidFile();
      width = data.readUInt32BE(0); height = data.readUInt32BE(4); dimensions(width, height);
      bits = data[8]; color = data[9]; channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[color];
      if (!channels || !({ 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] } as Record<number, number[]>)[color].includes(bits) || data[10] || data[11] || data[12] > 1) throw invalidFile();
      interlace = data[12];
    } else if (kind === "IDAT") compressed.push(data);
    else if (kind === "PLTE") { if (!length || length % 3 || length > 768) throw invalidFile(); palette = true; }
    else if (kind === "IEND") { if (length || end !== bytes.length) throw invalidFile(); ended = true; }
    else if (kind[0] === kind[0].toUpperCase()) throw invalidFile();
    offset = end;
  }
  if (!ended || offset !== bytes.length || !compressed.length || (color === 3 && !palette)) throw invalidFile();
  const passes = interlace ? [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]] : [[0, 0, 1, 1]];
  const expected = passes.reduce((total, [x, y, dx, dy]) => {
    const w = Math.max(0, Math.ceil((width - x) / dx)), h = Math.max(0, Math.ceil((height - y) / dy));
    return total + (w && h ? h * (1 + Math.ceil(w * channels * bits / 8)) : 0);
  }, 0);
  if (expected > 64 * 1024 * 1024) throw invalidFile();
  // Check compressed data without allocating a decoded bitmap or trusting its declared size.
  await new Promise<void>((resolve, reject) => {
    const inflate = createInflate(); let count = 0;
    inflate.on("data", chunk => { count += chunk.length; if (count > expected) inflate.destroy(invalidFile()); });
    inflate.on("error", () => reject(invalidFile()));
    inflate.on("end", () => count === expected ? resolve() : reject(invalidFile()));
    for (const chunk of compressed) inflate.write(chunk);
    inflate.end();
  });
}
function jpeg(bytes: Buffer) {
  if (bytes.length < 16 || bytes[0] !== 255 || bytes[1] !== 216) throw invalidFile();
  let offset = 2, frame = false, scan = false;
  while (offset < bytes.length) {
    if (bytes[offset++] !== 255) throw invalidFile();
    while (bytes[offset] === 255) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9) { if (!frame || !scan || offset !== bytes.length) throw invalidFile(); return; }
    if (marker === 0 || marker === 0xd8 || marker < 0xc0 || (marker >= 0xd0 && marker <= 0xd7)) throw invalidFile();
    if (offset + 2 > bytes.length) throw invalidFile();
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) throw invalidFile();
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      if (length < 11 || bytes[offset + 2] !== 8) throw invalidFile();
      dimensions(bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3)); frame = true;
    }
    offset += length;
    if (marker === 0xda) {
      if (!frame || length < 6) throw invalidFile(); scan = true;
      const start = offset;
      while (offset < bytes.length) {
        if (bytes[offset] !== 255) { offset++; continue; }
        if (bytes[offset + 1] === 0 || (bytes[offset + 1] >= 0xd0 && bytes[offset + 1] <= 0xd7)) { offset += 2; continue; }
        break;
      }
      if (offset === start) throw invalidFile();
    }
  }
  throw invalidFile();
}
function gif(bytes: Buffer) {
  if (!/^GIF8[79]a$/.test(bytes.toString("ascii", 0, 6)) || bytes.length < 14) throw invalidFile();
  dimensions(bytes.readUInt16LE(6), bytes.readUInt16LE(8));
  let offset = 13 + ((bytes[10] & 128) ? 3 * (2 ** ((bytes[10] & 7) + 1)) : 0), frames = 0;
  const blocks = () => { let nonempty = false; while (offset < bytes.length) { const n = bytes[offset++]; if (!n) return nonempty; nonempty = true; offset += n; if (offset > bytes.length) throw invalidFile(); } throw invalidFile(); };
  while (offset < bytes.length) {
    const kind = bytes[offset++];
    if (kind === 0x3b) { if (!frames || offset !== bytes.length) throw invalidFile(); return; }
    if (kind === 0x21) { if (offset >= bytes.length) throw invalidFile(); offset++; blocks(); }
    else if (kind === 0x2c) {
      if (offset + 10 > bytes.length) throw invalidFile();
      dimensions(bytes.readUInt16LE(offset + 4), bytes.readUInt16LE(offset + 6));
      const flags = bytes[offset + 8]; offset += 9 + ((flags & 128) ? 3 * (2 ** ((flags & 7) + 1)) : 0);
      const code = bytes[offset++]; if (code < 2 || code > 8 || !blocks()) throw invalidFile(); frames++;
    } else throw invalidFile();
  }
  throw invalidFile();
}
function webp(bytes: Buffer) {
  if (bytes.length < 26 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP" || bytes.readUInt32LE(4) + 8 !== bytes.length) throw invalidFile();
  let offset = 12, image = false;
  while (offset + 8 <= bytes.length) {
    const kind = bytes.toString("ascii", offset, offset + 4), n = bytes.readUInt32LE(offset + 4), start = offset + 8;
    if (start + n > bytes.length) throw invalidFile();
    if (kind === "VP8 ") {
      if (n < 10 || !bytes.subarray(start + 3, start + 6).equals(Buffer.from([157, 1, 42]))) throw invalidFile();
      dimensions(bytes.readUInt16LE(start + 6) & 0x3fff, bytes.readUInt16LE(start + 8) & 0x3fff); image = true;
    } else if (kind === "VP8L") {
      if (n < 5 || bytes[start] !== 47) throw invalidFile();
      const sizes = bytes.readUInt32LE(start + 1); dimensions((sizes & 0x3fff) + 1, ((sizes >>> 14) & 0x3fff) + 1); image = true;
    } else if (kind === "VP8X") {
      if (n !== 10) throw invalidFile(); dimensions(bytes.readUIntLE(start + 4, 3) + 1, bytes.readUIntLE(start + 7, 3) + 1);
      if (bytes[start] & 2) throw invalidFile(); // Animation is intentionally not enabled without a frame decoder.
    } else if (!["ALPH", "ICCP", "EXIF", "XMP "].includes(kind)) throw invalidFile();
    offset = start + n + (n % 2);
  }
  if (offset !== bytes.length || !image) throw invalidFile();
}
function pdf(bytes: Buffer) {
  const text = bytes.toString("latin1");
  if (!/^%PDF-1\.[0-7](?:\r|\n)/.test(text) || !/%%EOF\s*$/.test(text)) throw invalidFile();
  const names = text.replace(/#([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  // Conservative PDF subset: no scripts, actions/forms, encryption, embedded files or object streams.
  if (/\/(?:JS|JavaScript|OpenAction|AA|Launch|EmbeddedFiles?|Filespec|RichMedia|XFA|AcroForm|Encrypt|ObjStm|GoToR|SubmitForm|URI)\b/i.test(names)) throw invalidFile();
  const xref = /startxref\s+(\d+)\s+%%EOF\s*$/.exec(text);
  if (!xref || !/\/Type\s*\/Catalog\b/.test(names) || !/\/Type\s*\/Pages\b/.test(names) || !/\b\d+\s+\d+\s+obj\b/.test(text) || !/\bendobj\b/.test(text)) throw invalidFile();
  const start = Number(xref[1]);
  if (!Number.isSafeInteger(start) || start >= bytes.length || text.slice(start, start + 4) !== "xref" || !/\btrailer\s*<</.test(text.slice(start))) throw invalidFile();
}
export async function validateMedia(bytes: Buffer, mimeType: string): Promise<{ mimeType: MediaType; extension: string }> {
  if (!bytes.length) throw invalidFile();
  if (bytes.length > MAX_FILE_BYTES) throw tooLarge();
  if (!Object.hasOwn(mediaTypes, mimeType)) throw new FileError(415, "FILE_TYPE_UNSUPPORTED", "Supported formats are JPEG, PNG, WebP, GIF and PDF.");
  const validators = { "image/png": png, "image/jpeg": jpeg, "image/gif": gif, "image/webp": webp, "application/pdf": pdf };
  try { await validators[mimeType as MediaType](bytes); } catch { throw invalidFile(); }
  return { mimeType: mimeType as MediaType, extension: mediaTypes[mimeType as MediaType] };
}
