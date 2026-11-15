import "server-only";

export class AuthError extends Error {
  constructor(public readonly status: number, public readonly code: string, public readonly publicMessage: string) {
    super(code);
    this.name = "AuthError";
  }
}
export const invalidCredentials = () => new AuthError(401, "AUTH_INVALID_CREDENTIALS", "Invalid credentials or verification.");
export const invalidProof = () => new AuthError(400, "AUTH_INVALID_VERIFICATION", "Invalid or expired verification.");
export const unavailable = () => new AuthError(503, "AUTH_UNAVAILABLE", "Authentication is temporarily unavailable.");
export const forbidden = () => new AuthError(403, "AUTH_FORBIDDEN", "Access denied.");
