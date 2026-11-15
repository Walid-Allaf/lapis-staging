export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
}

export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return "";
  const clean = path.replace("|", "");
  if (/^(https?:|data:|blob:)/i.test(clean)) return clean;
  return `${getApiBaseUrl()}/${clean.replace(/^\/+/, "")}`;
}
