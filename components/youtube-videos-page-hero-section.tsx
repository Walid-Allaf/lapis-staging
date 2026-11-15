"use client";

import type { YouTubeGallery } from "@/lib/api/youtube-galleries";
import { useTranslation } from "@/lib/i18n/client";
import { UnderlineWord } from "./underline-word";

type YouTubeVideosPageHeroSectionProps = {
  videos: YouTubeGallery[];
};

type YouTubeVideoCardProps = {
  animationDelay?: number;
  video: YouTubeGallery;
};

function PlayIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5.8v12.4c0 .8.9 1.3 1.6.9l9.2-6.2c.6-.4.6-1.4 0-1.8L9.6 4.9C8.9 4.5 8 5 8 5.8Z" />
    </svg>
  );
}

function getYouTubeVideoId(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v");
      }

      const [, route, id] = url.pathname.split("/");

      if (route === "embed" || route === "shorts") {
        return id || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function YouTubeVideoCard({ animationDelay = 0, video }: YouTubeVideoCardProps) {
  const { language, t } = useTranslation();
  const isArabic = language === "ar";
  const title = isArabic ? video.titleAr : video.titleEn;
  const description = isArabic ? video.descriptionAr : video.descriptionEn;
  const videoId = getYouTubeVideoId(video.videoUrl);
  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : null;

  return (
    <article
      className="overflow-hidden rounded-[10px] border border-[var(--service-card-border-color)] bg-white shadow-[var(--shadow-token-md)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-token-lg)]"
      data-aos="fade-up"
      data-aos-delay={animationDelay}
    >
      <div className="relative aspect-video overflow-hidden bg-brand-navy">
        {embedUrl ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
            loading="lazy"
            src={embedUrl}
            title={title}
          />
        ) : (
          <a
            className="flex h-full w-full items-center justify-center gap-3 bg-brand-navy px-6 text-nav font-bold text-gold no-underline transition hover:text-white"
            href={video.videoUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="grid size-12 place-items-center rounded-full bg-gold text-gold-foreground">
              <PlayIcon />
            </span>
            {t("youtubeVideosPage.watchOnYoutube")}
          </a>
        )}
      </div>

      <div className="px-6 py-6 text-start">
        <h2 className="font-display text-heading-sm font-semibold leading-title text-primary">
          {title}
        </h2>
        <p className="mt-3 text-body-md leading-body text-[var(--color-muted)]">
          {description}
        </p>
      </div>
    </article>
  );
}

export function YouTubeVideosPageHeroSection({
  videos,
}: YouTubeVideosPageHeroSectionProps) {
  const { direction, t } = useTranslation();

  return (
    <section
      aria-labelledby="youtube-videos-page-heading"
      className="bg-background px-site-gutter-mobile pb-16 pt-10 lg:px-site-gutter lg:pb-20 lg:pt-4"
      dir={direction}
    >
      <div className="mx-auto max-w-site">
        <div className="mx-auto max-w-[680px] text-center" data-aos="fade-up">
          <h1
            id="youtube-videos-page-heading"
            className="font-display text-heading-lg font-semibold leading-heading text-primary lg:text-heading-xl"
          >
            <UnderlineWord>{t("youtubeVideosPage.title")}</UnderlineWord>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-body-lg leading-body text-[var(--color-muted)]">
            {t("youtubeVideosPage.body")}
          </p>
        </div>

        {videos.length > 0 ? (
          <div className="mt-14 grid gap-8 lg:mt-20 lg:grid-cols-2">
            {videos.map((video, index) => (
              <YouTubeVideoCard
                animationDelay={index * 100}
                key={video.id}
                video={video}
              />
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-14 max-w-[560px] rounded-[10px] border border-[var(--service-card-border-color)] bg-white px-6 py-8 text-center text-body-lg leading-body text-[var(--color-muted)]">
            {t("youtubeVideosPage.empty")}
          </p>
        )}
      </div>
    </section>
  );
}
