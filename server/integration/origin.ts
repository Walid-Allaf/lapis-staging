// Shared with next.config.ts; contains only public deployment configuration, never secrets.
export function applicationOrigin(env: Readonly<Record<string, string | undefined>> = process.env): URL {
  const raw = env.APP_ORIGIN ?? (env.SQL_ENV === "production" ? "" : "http://localhost:3000");
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error("APP_ORIGIN must be a configured absolute application origin."); }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      url.hostname.includes("*") || url.hostname.replace(/\.$/, "") === "lapis.runasp.net" || (url.protocol !== "https:" && !(url.protocol === "http:" && loopback && env.SQL_ENV !== "production"))) {
    throw new Error("APP_ORIGIN must be HTTPS, or nonproduction loopback HTTP, without paths or credentials.");
  }
  return url;
}
