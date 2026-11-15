// Shared role/expiry policy. The server enforces it before issuing or using a session.
export const ADMIN_ROLES = [1, 2, "superadmin", "manager", "admin"] as const;

export function isAdminRole(role: unknown): boolean {
  if (typeof role !== "string" && typeof role !== "number") return false;
  const normalized = typeof role === "string"
    ? role.trim().toLowerCase().replace(/[\s_-]/g, "")
    : role;
  const value = typeof normalized === "string" && /^\d+$/.test(normalized)
    ? Number(normalized) : normalized;
  return ADMIN_ROLES.some(allowed => allowed === value);
}

export function expiryTime(expiresOn: string | null): number {
  if (!expiresOn) return 0;
  // DateTime values without an explicit offset are UTC API timestamps.
  const value = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(expiresOn) ? expiresOn : `${expiresOn}Z`;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

export function safeDashboardRedirect(value: string | null): string {
  if (!value || /[\\\u0000-\u0020]/.test(value)) return "/dashboard";
  try {
    const decoded = decodeURIComponent(value);
    if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("\\")) return "/dashboard";
    const url = new URL(decoded, "https://dashboard.invalid");
    if (url.origin !== "https://dashboard.invalid" ||
      !(url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/")) ||
      /^\/dashboard\/login(?:\/|$)/.test(url.pathname)) return "/dashboard";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return "/dashboard"; }
}
