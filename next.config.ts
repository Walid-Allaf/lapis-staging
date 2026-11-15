import type { NextConfig } from "next";
import { applicationOrigin } from "./server/integration/origin";

const origin = applicationOrigin();
const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);

const nextConfig: NextConfig = {
  // Only public origins are compiled into JavaScript; no server secret belongs here.
  env: { NEXT_PUBLIC_API_BASE_URL: origin.origin, NEXT_PUBLIC_SITE_URL: origin.origin },
  // Keep SQL/SMTP drivers in Node; optional identity transports probe Windows executables when bundled.
  serverExternalPackages: ["mssql", "nodemailer"],
  // The diagnostic reads checksums at runtime; include SQL in traced deployments.
  outputFileTracingIncludes: { "/api/health": ["./db/migrations/**/*.sql"] },
  experimental: { globalNotFound: true },
  async headers() {
    return [{
      source: "/dashboard/:path*",
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "same-origin" },
      ],
    }];
  },
  images: {
    remotePatterns: [
      {
        protocol: origin.protocol.slice(0, -1) as "http" | "https",
        hostname: origin.hostname,
        port: origin.port,
        pathname: "/uploads/**",
        search: "",
      },
    ],
    maximumRedirects: 0,
    dangerouslyAllowLocalIP: local && process.env.SQL_ENV !== "production",
  },
};

export default nextConfig;
