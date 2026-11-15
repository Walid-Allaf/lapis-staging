"use client";

import { useState } from "react";
import type { FAQ } from "@/lib/api/faqs";
import { useTranslation } from "@/lib/i18n/client";

type FAQSectionProps = {
  faqs: FAQ[];
};

function PlusIcon() {
  return (
    <span className="faq-toggle-icon" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const { t, direction, language } = useTranslation();
  const isArabic = language === "ar";
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);

  return (
    <section
      className="faq-section px-site-gutter-mobile py-[var(--faq-section-y-mobile)] lg:px-0 lg:py-[var(--faq-section-y)]"
      aria-labelledby="faq-heading"
      dir={direction}
    >
      <div className="faq-content mx-auto">
        <div
          className="mx-auto max-w-[var(--faq-title-width)] text-center"
          data-aos="fade-up"
        >
          <h2
            id="faq-heading"
            className="font-display text-heading-md font-semibold capitalize leading-title text-primary lg:text-heading-lg"
          >
            {t("faqs.title")}
          </h2>
          <p className="mx-auto mt-[var(--faq-copy-gap)] max-w-[var(--faq-body-width)] text-[var(--color-muted)]">
            {t("faqs.body")}
          </p>
        </div>

        {faqs.length > 0 ? (
          <div className="faq-list mx-auto">
            {faqs.map((faq, index) => {
              const isOpen = openId === faq.id;
              const answerId = `faq-answer-${faq.id}`;
              const question = isArabic ? faq.questionAr : faq.questionEn;
              const answer = isArabic ? faq.answerAr : faq.answerEn;

              return (
                <article
                  key={faq.id}
                  className={isOpen ? "faq-item faq-item-open" : "faq-item"}
                  data-aos="fade-up"
                  data-aos-delay={index * 80}
                >
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                  >
                    <span className="faq-question-text">{question}</span>
                    <PlusIcon />
                  </button>
                  <div
                    id={answerId}
                    className="faq-answer"
                    hidden={!isOpen}
                  >
                    <p>{answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="faq-empty mx-auto">{t("faqs.empty")}</p>
        )}
      </div>
    </section>
  );
}
