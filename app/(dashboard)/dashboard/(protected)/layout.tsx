"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { expiryTime } from "@/dashboard/api/auth";
import { isAdminSession, useAuthStore } from "@/dashboard/stores/use-auth-store";
import { DashboardLoading } from "@/dashboard/layouts/loading";
import { DashboardShell } from "@/dashboard/layouts/shell";

export default function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
  const state = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const allowed = state.status !== "checking" && isAdminSession(state);

  useEffect(() => {
    if (state.status === "checking") return;
    if (!allowed) {
      if (state.isLoggingOut) {
        router.replace("/dashboard/login");
        return;
      }
      if (state.status === "authenticated") state.logout();
      const path = pathname + window.location.search;
      router.replace(`/dashboard/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    const expiresAt = expiryTime(state.expiresOn);
    let timer: number;
    const checkExpiry = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) state.logout();
      else timer = window.setTimeout(checkExpiry, Math.min(remaining, 2_147_483_647));
    };
    checkExpiry();
    return () => window.clearTimeout(timer);
  }, [allowed, pathname, router, state]);

  if (!allowed) return <DashboardLoading />;
  return <DashboardShell>{children}</DashboardShell>;
}
