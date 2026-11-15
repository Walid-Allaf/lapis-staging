"use client";

import AOS from "aos";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n/client";

export function AOSInitializer() {
  const pathname = usePathname();
  const { language } = useTranslation();

  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      offset: 80,
      once: true,
    });
  }, []);

  useEffect(() => {
    AOS.refreshHard();
  }, [language, pathname]);

  return null;
}
