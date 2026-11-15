import SiteLayout from "./(site)/layout";
import NotFound from "./(site)/not-found";
import { createRootMetadata } from "@/lib/seo";
import { createAbsoluteUrl } from "@/lib/seo-shared";
import openGraphImage from "./opengraph-image.png";
import twitterImage from "./twitter-image.png";

export async function generateMetadata() {
  const metadata = await createRootMetadata();
  // Global 404s bypass metadata-file inheritance as well as layouts. Restore
  // the same public images and their actual dimensions explicitly.
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, images: [{
      url: createAbsoluteUrl("/opengraph-image.png"),
      width: openGraphImage.width, height: openGraphImage.height, type: "image/png",
    }] },
    twitter: { ...metadata.twitter, images: [{
      url: createAbsoluteUrl("/twitter-image.png"),
      width: twitterImage.width, height: twitterImage.height, type: "image/png",
    }] },
  };
}

// Multiple root layouts have no shared document. Reuse the public document
// so unmatched public URLs keep the existing language, chrome, and 404 UI.
export default function GlobalNotFound() {
  return <SiteLayout><NotFound /></SiteLayout>;
}
