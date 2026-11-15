import "server-only";

export class FileError extends Error {
  constructor(public readonly status: number, public readonly code: string, public readonly publicMessage: string) {
    super(code);
  }
}
export const invalidFile = () => new FileError(400, "FILE_INVALID", "The upload is missing, malformed or contains an invalid file.");
export const storageUnavailable = () => new FileError(503, "FILE_STORAGE_UNAVAILABLE", "Media storage is temporarily unavailable.");
export const tooLarge = () => new FileError(413, "FILE_TOO_LARGE", "The maximum file size is 4 MiB.");
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_MULTIPART_BYTES = MAX_FILE_BYTES + 8192 + 80;
