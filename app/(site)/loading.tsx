import { SiteLogo } from "@/components/site-logo";

export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh)] items-center justify-center bg-[linear-gradient(180deg,var(--surface-muted)_0%,rgb(230_246_254_/_0)_45%),var(--background)] px-site-gutter-mobile py-16 lg:min-h-[calc(100vh)] lg:px-site-gutter">
      <section
        aria-label="Loading"
        aria-live="polite"
        className="flex w-full max-w-[420px] flex-col items-center text-center"
      >
        <div className="relative grid size-42 place-items-center">
          <span className="absolute inset-0 rounded-full border border-secondary/30" />
          <span className="absolute inset-3 animate-ping rounded-full bg-secondary/10" />
          <span className="relative grid size-36 place-items-center rounded-full bg-white shadow-[var(--shadow-token-avatar)]">
            <SiteLogo className="max-h-12 max-w-[150px]" variant="dark" />
          </span>
        </div>

        <div className="mt-9 flex w-full flex-col items-center gap-3">
          <span className="h-3 w-2/3 animate-pulse rounded-full bg-primary/15" />
          <span className="h-3 w-1/2 animate-pulse rounded-full bg-secondary/25 [animation-delay:120ms]" />
          <span className="h-3 w-3/4 animate-pulse rounded-full bg-gold/25 [animation-delay:240ms]" />
        </div>

        <div className="mt-8 flex items-center gap-2" aria-hidden="true">
          <span className="size-2 animate-bounce rounded-full bg-secondary" />
          <span className="size-2 animate-bounce rounded-full bg-gold [animation-delay:120ms]" />
          <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
        </div>
      </section>
    </main>
  );
}
