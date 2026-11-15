import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/api/blog-posts";
import { createAbsoluteUrl } from "@/lib/seo-shared";

const now = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getBlogPosts({ pageSize: 100 }).catch(() => ({
    data: [],
  }));

  return [
    {
      url: createAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      images: [
        createAbsoluteUrl("/hero-dental-team.png"),
        createAbsoluteUrl("/welcoming.png"),
        createAbsoluteUrl("/dental.png"),
        createAbsoluteUrl("/smile.png"),
      ],
    },
    {
      url: createAbsoluteUrl("/services"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: createAbsoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [createAbsoluteUrl("/about.png")],
    },
    {
      url: createAbsoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: createAbsoluteUrl("/gallery"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: createAbsoluteUrl("/youtube-videos"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: createAbsoluteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPosts.data.map((post) => ({
      url: createAbsoluteUrl(`/blog/${encodeURIComponent(post.slug)}`),
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    })),
  ];
}
