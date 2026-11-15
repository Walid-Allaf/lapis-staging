"use client";

import Link from "next/link";
import type { SVGProps } from "react";
import { SiteLogo } from "@/components/site-logo";
import type { SiteSettings } from "@/lib/api/settings";
import { useTranslation } from "@/lib/i18n/client";
import { getVisibleNavItems } from "@/lib/navigation";

type SiteFooterProps = {
  settings: SiteSettings | null;
};

type SocialIconProps = SVGProps<SVGSVGElement>;

function FacebookIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path
        d="M18.5 28V17.4h3.6l.5-4.1h-4.1v-2.6c0-1.2.3-2 2-2h2.2V5.1c-.4-.1-1.7-.2-3.2-.2-3.2 0-5.4 1.9-5.4 5.5v3H10.5v4.1h3.6V28h4.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10.8 4.5h10.4a6.3 6.3 0 0 1 6.3 6.3v10.4a6.3 6.3 0 0 1-6.3 6.3H10.8a6.3 6.3 0 0 1-6.3-6.3V10.8a6.3 6.3 0 0 1 6.3-6.3Zm0 2.5A3.8 3.8 0 0 0 7 10.8v10.4a3.8 3.8 0 0 0 3.8 3.8h10.4a3.8 3.8 0 0 0 3.8-3.8V10.8A3.8 3.8 0 0 0 21.2 7H10.8Zm5.2 4.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5.1-3.9a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function YoutubeIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path
        d="M28.1 10.2c-.3-1.2-1.2-2.1-2.4-2.4C23.6 7.2 16 7.2 16 7.2s-7.6 0-9.7.6c-1.2.3-2.1 1.2-2.4 2.4-.6 2.1-.6 5.8-.6 5.8s0 3.7.6 5.8c.3 1.2 1.2 2.1 2.4 2.4 2.1.6 9.7.6 9.7.6s7.6 0 9.7-.6c1.2-.3 2.1-1.2 2.4-2.4.6-2.1.6-5.8.6-5.8s0-3.7-.6-5.8ZM13.5 20V12l7 4-7 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TwitterIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path
        d="M18.4 14.1 27.2 4h-2.1l-7.6 8.7L11.4 4h-7l9.2 13.1L4.4 28h2.1l8.1-9.4 6.5 9.4h7l-9.7-13.9Zm-2.9 3.3-.9-1.3L7.2 5.5h3.2l6 8.6.9 1.3 7.8 11.2h-3.2l-6.4-9.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TiktokIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20.2 4c.4 3 2.1 4.8 5 5v4.1a9.4 9.4 0 0 1-4.9-1.5v8.6c0 4.3-2.8 7.8-7.1 7.8-4 0-7.2-3-7.2-6.9 0-4.3 3.3-7.2 7.6-6.8v4.2c-2-.5-3.5.7-3.5 2.5 0 1.6 1.3 2.8 3 2.8 1.9 0 3-1.1 3-3.5V4h4.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SiteFooter({ settings }: SiteFooterProps) {
  const { t, direction } = useTranslation();
  const visibleNavItems = getVisibleNavItems(settings);
  const socialLinks = [
    { key: "facebook", href: settings?.facebookUrl, label: "footer.facebook", Icon: FacebookIcon },
    { key: "instagram", href: settings?.instagramUrl, label: "footer.instagram", Icon: InstagramIcon },
    { key: "youtube", href: settings?.youtubeUrl, label: "footer.youtube", Icon: YoutubeIcon },
    { key: "twitter", href: settings?.twitterUrl, label: "footer.twitter", Icon: TwitterIcon },
    { key: "tiktok", href: settings?.tiktokUrl, label: "footer.tiktok", Icon: TiktokIcon },
  ].filter((item) => item.href);

  return (
    <footer className="site-footer px-site-gutter-mobile lg:px-site-gutter" dir={direction}>
      <div className="site-footer-content mx-auto" data-aos="fade-up">
        <div className="site-footer-top">
          <Link href="/" className="site-footer-brand" aria-label={t("brand.homeLabel")}>
            <SiteLogo className="max-h-12" variant="dark" />
          </Link>

          <nav className="site-footer-nav" aria-label={t("footer.navigationLabel")}>
            {visibleNavItems.map((item) => (
              <Link key={item.name} href={item.link} className="site-footer-nav-link">
                {t(item.name)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="site-footer-divider" />

        <div className="site-footer-bottom">
          <p className="site-footer-copyright">{t("footer.copyright")}</p>

          {socialLinks.length > 0 ? (
            <div className="site-footer-socials" aria-label={t("footer.socialLabel")}>
              {socialLinks.map(({ key, href, label, Icon }) => (
                <a
                  key={key}
                  href={href}
                  className="site-footer-social-link"
                  aria-label={t(label)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="size-full" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
