"use client";

import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { defaultNS, fallbackLng, getDirection, isLanguage } from "./settings";
import { resources } from "./resources";
import { languageCookieKey } from "@/lib/seo-shared";

const storageKey = languageCookieKey;

let initialized = false;

function initI18n() {
  if (initialized) {
    return;
  }

  i18next.use(resourcesToBackend(resources)).init({
    lng: fallbackLng,
    fallbackLng,
    ns: [defaultNS],
    defaultNS,
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
  });

  initialized = true;
}

function detectStoredLanguage() {
  if (typeof window === "undefined") {
    return fallbackLng;
  }

  const stored = window.localStorage.getItem(storageKey);
  if (isLanguage(stored)) {
    return stored;
  }

  const cookieLanguage = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${storageKey}=`))
    ?.split("=")[1];

  if (isLanguage(cookieLanguage)) {
    return cookieLanguage;
  }

  const browserLanguage = window.navigator.language.split("-")[0];
  return isLanguage(browserLanguage) ? browserLanguage : fallbackLng;
}

function persistLanguage(language: string) {
  if (typeof window === "undefined" || !isLanguage(language)) {
    return;
  }

  window.localStorage.setItem(storageKey, language);
  document.cookie = `${storageKey}=${language}; path=/; max-age=31536000; SameSite=Lax`;
}

function syncDocument(language: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = language;
  document.documentElement.dir = getDirection(language);
}

function subscribe(callback: () => void) {
  i18next.on("languageChanged", callback);
  i18next.on("loaded", callback);

  return () => {
    i18next.off("languageChanged", callback);
    i18next.off("loaded", callback);
  };
}

initI18n();

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const language = detectStoredLanguage();
    persistLanguage(language);
    syncDocument(language);

    if (i18next.language !== language) {
      void i18next.changeLanguage(language);
    }
  }, []);

  return children;
}

export function useTranslation() {
  const language = useSyncExternalStore(
    subscribe,
    () => i18next.language,
    () => fallbackLng,
  );

  const t = useMemo(() => i18next.getFixedT(language, defaultNS), [language]);

  const changeLanguage = useCallback(async (nextLanguage: string) => {
    if (!isLanguage(nextLanguage)) {
      return;
    }

    persistLanguage(nextLanguage);
    syncDocument(nextLanguage);
    await i18next.changeLanguage(nextLanguage);
  }, []);

  return {
    t,
    language,
    direction: getDirection(language),
    changeLanguage,
  };
}
