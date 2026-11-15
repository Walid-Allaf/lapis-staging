"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Login } from "@/dashboard/features/login";
import { checkDashboardSession, isAdminSession, useAuthStore } from "@/dashboard/stores/use-auth-store";
import { safeDashboardRedirect } from "@/dashboard/api/auth";
import { DashboardLoading } from "@/dashboard/layouts/loading";

export default function LoginPage() {
  const state = useAuthStore();
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    let active = true;
    void checkDashboardSession().finally(() => { if (active) setVerified(true); });
    return () => { active = false; };
  }, []);
  const allowed = verified && state.status !== "checking" && isAdminSession(state);
  useEffect(() => {
    if (allowed) {
      router.replace(safeDashboardRedirect(new URLSearchParams(window.location.search).get("redirect")));
    } else if (verified && state.status === "authenticated") state.logout();
  }, [allowed, router, state, verified]);
  if (!verified || state.status === "checking" || allowed) return <DashboardLoading />;
  return <Login />;
}
