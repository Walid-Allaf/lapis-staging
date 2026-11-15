"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/client";
import { UnderlineWord } from "./underline-word";

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[var(--intro-play-icon-size)]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5.8v12.4c0 .8.9 1.3 1.6.9l9.2-6.2c.6-.4.6-1.4 0-1.8L9.6 4.9C8.9 4.5 8 5 8 5.8Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-[var(--intro-play-icon-size)]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5.5c-.8 0-1.5.7-1.5 1.5v10c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5V7c0-.8-.7-1.5-1.5-1.5H8Zm7 0c-.8 0-1.5.7-1.5 1.5v10c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5V7c0-.8-.7-1.5-1.5-1.5h-1Z" />
    </svg>
  );
}

export function IntroVideoSection() {
  const { t, direction } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function toggleVideo() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (isPlaying) {
      video.pause();
      return;
    }

    await video.play();
    setIsPlaying(true);
  }

  return (
    <section
      className="intro-section px-site-gutter-mobile py-[var(--intro-section-y-mobile)] lg:px-0 lg:py-[var(--intro-section-y)]"
      aria-labelledby="intro-video-heading"
      dir={direction}
    >
      <div className="intro-layout mx-auto">
        <div className="intro-copy mx-auto text-center" data-aos="fade-up">
          <h2
            id="intro-video-heading"
            className="mx-auto max-w-[var(--intro-title-width)] font-display text-heading-md font-semibold capitalize leading-title text-primary lg:text-heading-lg"
          >
            <span>{t("introVideo.titlePrefix")}</span>{" "}
            <UnderlineWord>{t("introVideo.titleHighlight")}</UnderlineWord>{" "}
            <span>{t("introVideo.titleSuffix")}</span>
          </h2>
          <p className="mx-auto mt-[var(--intro-copy-gap)] max-w-[var(--intro-body-width)] text-body-lg text-[var(--color-muted)]">
            {t("introVideo.body")}
          </p>
        </div>

        <div className="intro-video-frame" data-aos="zoom-in" data-aos-delay="150">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            preload="metadata"
            aria-label={t("introVideo.videoLabel")}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            <source src="/intro.mp4" type="video/mp4" />
            {t("introVideo.videoFallback")}
          </video>
          {!isPlaying ? <div className="intro-video-overlay" aria-hidden="true" /> : null}
          <button
            type="button"
            className="intro-play-button"
            aria-label={t(isPlaying ? "introVideo.pause" : "introVideo.play")}
            onClick={() => void toggleVideo()}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
        <div
          className="w-full mt-8 flex justify-center"
          data-aos="fade-up"
          data-aos-delay="250"
        >
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="intro-playlist-button mx-auto"
          >
            {t("introVideo.watchPlaylist")}
          </a>
        </div>
      </div>
    </section>
  );
}
