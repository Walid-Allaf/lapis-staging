"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SiteLogo } from "@/components/site-logo";
import type { SiteSettings } from "@/lib/api/settings";
import { useTranslation } from "@/lib/i18n/client";
import { getVisibleNavItems } from "@/lib/navigation";

type SiteHeaderProps = {
  settings: SiteSettings | null;
};

export function SiteHeader({ settings }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, direction, changeLanguage } = useTranslation();
  const nextLanguage = language === "ar" ? "en" : "ar";
  const visibleNavItems = getVisibleNavItems(settings);

  function isActiveLink(link: string) {
    return link === "/" ? pathname === "/" : pathname.startsWith(link);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="px-site-gutter-mobile pt-6 lg:px-0 lg:pt-header-top">
      <nav
        aria-label={t("header.navigationLabel")}
        className="relative mx-auto flex h-header-height-mobile w-full max-w-site items-center justify-between bg-brand-navy px-6 text-primary-foreground lg:h-header-height lg:px-10 rounded-sm"
        dir={direction}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label={t("brand.homeLabel")}
          onClick={closeMenu}
        >
          <SiteLogo className="max-h-10 lg:max-h-12" variant="whiteGold" />
        </Link>

        <div className="hidden items-center gap-9 text-nav font-medium lg:flex">
          {visibleNavItems.map((item) => {
            const isActive = isActiveLink(item.link);

            return (
              <Link
                key={item.name}
                href={item.link}
                aria-current={isActive ? "page" : undefined}
                className={`transition-colors hover:text-gold focus-visible:text-gold ${
                  isActive ? "text-secondary" : ""
                }`}
              >
                {t(item.name)}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="hidden h-[var(--button-height)] min-w-32 items-center justify-center bg-gold px-7 text-nav font-bold text-gold-foreground transition-colors hover:bg-primary-hover lg:flex rounded-sm"
          aria-label={t("header.switchLanguage")}
          onClick={() => void changeLanguage(nextLanguage)}
        >
          {t("language.next")}
        </button>

        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            className="h-11 min-w-20 bg-gold px-4 text-nav font-bold text-gold-foreground rounded-sm"
            aria-label={t("header.switchLanguage")}
            onClick={() => void changeLanguage(nextLanguage)}
          >
            {t("language.next")}
          </button>
          <button
            type="button"
            className="grid size-11 place-items-center bg-gold text-gold-foreground rounded-sm"
            aria-label={isMenuOpen ? t("header.closeMenu") : t("header.openMenu")}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            <span className="flex w-6 flex-col gap-1.5">
              <span className="h-0.5 w-full bg-current" />
              <span className="h-0.5 w-full bg-current" />
              <span className="h-0.5 w-full bg-current" />
            </span>
          </button>
        </div>

        <div
          id="mobile-navigation"
          className={`absolute inset-x-0 top-full z-30 bg-brand-navy px-6 py-5 shadow-lg lg:hidden ${
            isMenuOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex flex-col gap-4 text-nav font-medium">
            {visibleNavItems.map((item) => {
              const isActive = isActiveLink(item.link);

              return (
                <Link
                  key={item.name}
                  href={item.link}
                  aria-current={isActive ? "page" : undefined}
                  className={`py-2 transition-colors hover:text-gold focus-visible:text-gold ${
                    isActive ? "text-secondary" : ""
                  }`}
                  onClick={closeMenu}
                >
                  {t(item.name)}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
