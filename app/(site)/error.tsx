"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SiteLogo } from "@/components/site-logo";
import { useTranslation } from "@/lib/i18n/client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,var(--surface-muted)_0%,rgb(230_246_254_/_0)_38%),var(--background)] px-[var(--layout-section-x-mobile)] py-14 lg:px-[var(--layout-section-x)] lg:py-20">
      <section
        aria-labelledby="error-title"
        className="w-full max-w-2xl rounded-[10px] border border-[var(--service-card-border-color)] bg-white px-6 py-10 text-center shadow-[var(--shadow-token-sky)] sm:px-10 lg:py-12"
      >
        <SiteLogo className="mx-auto max-h-16" variant="dark" />
        <p className="mt-6 text-nav font-bold text-gold">
          {t("fallback.error.eyebrow")}
        </p>
        <h1
          id="error-title"
          className="mx-auto mt-2 max-w-xl text-heading-md font-bold leading-heading text-ink lg:text-heading-lg"
        >
          {t("fallback.error.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-body-md leading-body text-body lg:text-body-lg">
          {t("fallback.error.body")}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="inline-flex h-[var(--button-height)] cursor-pointer items-center justify-center rounded-[5px] bg-gold px-8 text-nav font-bold text-gold-foreground transition hover:bg-primary-hover"
            onClick={unstable_retry}
            type="button"
          >
            {t("fallback.error.retry")}
          </button>
          <Link
            href="/"
            className="inline-flex h-[var(--button-height)] items-center justify-center rounded-[5px] border border-[var(--service-card-border-color)] bg-white px-8 text-nav font-bold text-ink no-underline transition hover:border-gold hover:text-gold"
          >
            {t("fallback.home")}
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-6 break-words text-body-sm leading-body text-muted-foreground">
            {t("fallback.error.digestLabel")}: {error.digest}
          </p>
        ) : null}
      </section>
    </main>
  );
}
