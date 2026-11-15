import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginService, logoutService } from "../services";
import { useAuthStore } from "@/dashboard/stores/use-auth-store";
import { safeDashboardRedirect } from "@/dashboard/api/auth";

export function useLogin() {
  const login = useAuthStore(state => state.login);
  const router = useRouter();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: loginService,
    onSuccess: response => {
      if (!login(response)) {
        toast.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً");
        return;
      }
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      router.replace(safeDashboardRedirect(redirect));
    },
  });
  return { handleLogin: mutateAsync, isPending };
}

export function useLogout() {
  const logout = useAuthStore(state => state.logout);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      logout(true);
      queryClient.clear();
      router.replace("/dashboard/login");
      // Cookie mutations in Route Handlers do not invalidate the client Router
      // Cache. Discard cached login payloads and all authenticated client state.
      window.location.replace("/dashboard/login");
    },
  });
  return { handleLogout: mutateAsync, isPending };
}
