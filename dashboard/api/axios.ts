import Axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/dashboard/stores/use-auth-store";

export const axios = Axios.create({
  baseURL: "/dashboard/api/proxy/",
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});


axios.interceptors.request.use(config => {
  config.headers.Accept = "application/json";
  config.headers["Accept-Language"] = "ar";
  config.headers.timezone = `${new Date().getTimezoneOffset()}`;
  return config;
});

axios.interceptors.response.use(response => response, (error: unknown) => {
  if (!Axios.isAxiosError<{ message?: string }>(error)) return Promise.reject(error);
  const { response, message } = error;
  if (message === "Network Error") toast.error("خطأ في الشبكة");
  else if (message?.includes("timeout")) toast.error("تم تجاوز مهلة الخادم");
  else if (response?.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== "undefined" && window.location.pathname !== "/dashboard/login") {
      const redirect = window.location.pathname + window.location.search;
      window.location.assign(`/dashboard/login?redirect=${encodeURIComponent(redirect)}`);
    } else toast.error(response.data?.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
  } else toast.error(response?.data?.message || "حدث خطأ غير متوقع");
  return Promise.reject(error);
});

export default axios;
