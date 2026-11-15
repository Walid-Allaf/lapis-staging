import "server-only";

export class ContentError extends Error {
  constructor(public readonly status: number, public readonly code: string, public readonly publicMessage: string) {
    super(code);
    this.name = "ContentError";
  }
}
export const invalidContent = () => new ContentError(400, "CONTENT_INVALID_REQUEST", "Invalid content request.");
export const missingContent = () => new ContentError(404, "CONTENT_NOT_FOUND", "Content not found.");
export const conflictingContent = () => new ContentError(409, "CONTENT_IN_USE", "Content is referenced and cannot be deleted.");
