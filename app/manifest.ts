import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LAPiS Dental Lab",
    short_name: "LAPiS",
    description:
      "LAPiS Dental Lab official website for precise dental lab services.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#021f46",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
