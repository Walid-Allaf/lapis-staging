import { create } from "zustand";
import { expiryTime, isAdminRole } from "@/dashboard/api/auth";
import type { DashboardSession, SessionUser } from "@/dashboard/api/session-contract";

export type LoginResponse = DashboardSession;
export interface AuthState {
  user: SessionUser | null;
  expiresOn: string | null;
  status: "checking" | "authenticated" | "unauthenticated";
  isLoggingOut: boolean;
  login: (session: DashboardSession) => boolean;
  logout: (intentional?: boolean) => void;
}
const emptySession = { user: null, expiresOn: null, status: "unauthenticated" as const };
let revision = 0;
let pending: Promise<void> | undefined;

export function isAdminSession(state: Pick<AuthState, "user" | "expiresOn" | "status">): boolean {
  return state.status === "authenticated" && Boolean(state.user && isAdminRole(state.user.role)) && expiryTime(state.expiresOn) > Date.now();
}

export const useAuthStore = create<AuthState>()((set) => ({
  ...emptySession, status: "checking", isLoggingOut: false,
  login: session => {
    revision++;
    if (!session?.user || !isAdminRole(session.user.role) || expiryTime(session.expiresOn) <= Date.now()) {
      set(emptySession);
      return false;
    }
    set({ user: session.user, expiresOn: session.expiresOn, status: "authenticated", isLoggingOut: false });
    return true;
  },
  logout: intentional => {
    revision++;
    // Background session/401 checks must not replace an intentional logout's
    // plain login destination with a protected-page return URL.
    set(state => ({ ...emptySession, isLoggingOut: intentional ?? state.isLoggingOut }));
  },
}));

export function checkDashboardSession(): Promise<void> {
  if (pending) return pending;
  const startedAt = revision;
  pending = fetch("/dashboard/api/session", { cache: "no-store", credentials: "same-origin" })
    .then(async response => {
      const session = response.ok ? await response.json() as DashboardSession : null;
      if (revision !== startedAt) return;
      if (session) useAuthStore.getState().login(session);
      else useAuthStore.getState().logout();
    })
    .catch(() => { if (revision === startedAt) useAuthStore.getState().logout(); })
    .finally(() => { pending = undefined; });
  return pending;
}
