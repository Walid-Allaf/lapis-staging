import type { MetadataRoute } from "next";
import { createAbsoluteUrl } from "@/lib/seo-shared";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard"],
    },
    sitemap: createAbsoluteUrl("/sitemap.xml"),
  };
}
