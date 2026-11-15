"use client";

import type { ComponentType } from "react";
import type { SiteSettings } from "@/lib/api/settings";
import { useTranslation } from "@/lib/i18n/client";
import { UnderlineWord } from "./underline-word";

type ContactPageHeroSectionProps = {
  settings: SiteSettings | null;
};

type ContactCard = {
  animationDelay?: number;
  href?: string;
  Icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.7v4.7l3.3 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M18.5 10.2c0 4.8-6.5 9-6.5 9s-6.5-4.2-6.5-9a6.5 6.5 0 0 1 13 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10.2" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M8.2 5.2 10 9.1 8.5 11c1 2 2.6 3.6 4.6 4.6l1.9-1.5 3.8 1.8-.6 3.1c-.1.6-.7 1-1.3.9C10.2 19.3 4.7 13.8 4.1 7.1c-.1-.6.3-1.2.9-1.3l3.2-.6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect
        height="13.5"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
        width="17"
        x="3.5"
        y="5.25"
      />
      <path
        d="m5.4 8 6.6 4.8L18.6 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function getMapQuery(settings: SiteSettings | null, address: string) {
  const latitude = Number(settings?.latitude);
  const longitude = Number(settings?.longitude);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `${latitude},${longitude}`;
  }

  return address;
}

function ContactInfoCard({ animationDelay = 0, href, Icon, label, value }: ContactCard) {
  const content = (
    <>
      <span className="grid size-[53px] shrink-0 place-items-center rounded-full bg-gold text-gold-foreground">
        <Icon className="size-[27px]" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[1.375rem] font-semibold leading-title text-primary">
          {label}
        </span>
        <span className="mt-1 block text-body-md leading-body text-[var(--color-muted)]">
          {value}
        </span>
      </span>
    </>
  );

  const className =
    "flex min-h-[93px] items-center gap-[15px] rounded-[10px] bg-white px-5 py-5 text-start shadow-[var(--shadow-token-lg)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-token-md)]";

  return href ? (
    <a
      className={`${className} no-underline`}
      data-aos="fade-up"
      data-aos-delay={animationDelay}
      href={href}
    >
      {content}
    </a>
  ) : (
    <article className={className} data-aos="fade-up" data-aos-delay={animationDelay}>
      {content}
    </article>
  );
}

export function ContactPageHeroSection({ settings }: ContactPageHeroSectionProps) {
  const { direction, language, t } = useTranslation();
  const contactText =
    language === "ar" ? settings?.contactUs_Ar : settings?.contactUs_En;
  const address = settings?.address || t("contactPage.fallbackAddress");
  const email = settings?.email || t("contactPage.fallbackEmail");
  const phoneNumber = settings?.phoneNumber || t("contactPage.fallbackPhone");
  const mapQuery = getMapQuery(settings, address);
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;
  const cards: ContactCard[] = [
    {
      Icon: ClockIcon,
      label: t("contactPage.officeTimings"),
      value: t("contactPage.officeTimingsValue"),
    },
    {
      href: settings?.email ? `mailto:${settings.email}` : undefined,
      Icon: MailIcon,
      label: t("contactPage.emailAddress"),
      value: email,
    },
    {
      href: settings?.phoneNumber ? `tel:${settings.phoneNumber}` : undefined,
      Icon: PhoneIcon,
      label: t("contactPage.phoneNumber"),
      value: phoneNumber,
    },
    {
      Icon: PinIcon,
      label: t("contactPage.address"),
      value: address,
    },
  ];

  return (
    <section
      aria-labelledby="contact-page-heading"
      className="bg-background px-site-gutter-mobile pb-16 pt-10 lg:px-site-gutter lg:pb-20 lg:pt-4"
      dir={direction}
    >
      <div className="mx-auto max-w-[1092px]">
        <div className="text-center" data-aos="fade-up">
          <h1
            id="contact-page-heading"
            className="font-display text-heading-lg font-semibold leading-heading text-primary lg:text-heading-xl"
          >
            <UnderlineWord>{t("contactPage.title")}</UnderlineWord>
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-body-lg leading-body text-[var(--color-muted)]">
            {contactText || t("contactPage.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:mt-[86px] lg:grid-cols-[541px_minmax(0,503px)] lg:gap-12">
          <div
            className="overflow-hidden rounded-[10px] border-2 border-primary bg-surface-muted shadow-[var(--shadow-token-md)]"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <iframe
              className="h-[360px] w-full lg:h-[458px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
              title={t("contactPage.mapTitle")}
            />
            <p className="border-t border-[var(--service-card-border-color)] bg-white px-5 py-4 text-body-md leading-body text-ink">
              <span className="font-semibold text-primary">{t("contactPage.address")}: </span>
              {address}
            </p>
          </div>

          <div className="grid content-between gap-5">
            {cards.map((card, index) => (
              <ContactInfoCard
                animationDelay={150 + index * 80}
                key={card.label}
                {...card}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
