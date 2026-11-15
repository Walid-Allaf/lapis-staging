"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { createInstance } from "i18next";
import { createQueryClient } from "@/dashboard/lib/react-query";
import { Toaster } from "@/dashboard/components/shadcn-ui/sonner";
import { useAuthStore, checkDashboardSession } from "@/dashboard/stores/use-auth-store";
import translation from "@/dashboard/i18n/ar.json";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [i18n] = useState(() => {
    const instance = createInstance();
    void instance.init({ lng: "ar", fallbackLng: "ar", supportedLngs: ["ar"],
      resources: { ar: { translation } }, initAsync: false,
      interpolation: { escapeValue: false } });
    return instance;
  });
  useEffect(() => {
    // Delete tokens left by the previous same-origin browser-storage model.
    try { window.localStorage.removeItem("lapis-auth"); } catch { /* Storage can be unavailable. */ }
    void checkDashboardSession();
    return useAuthStore.subscribe((state, previous) => {
      if (previous.status === "authenticated" && (state.status !== "authenticated" || state.user?.id !== previous.user?.id)) {
        void queryClient.cancelQueries();
        queryClient.clear();
      }
    });
  }, [queryClient]);
  return <I18nextProvider i18n={i18n}><QueryClientProvider client={queryClient}>
    {children}<Toaster position="bottom-right" dir="rtl" />
  </QueryClientProvider></I18nextProvider>;
}
