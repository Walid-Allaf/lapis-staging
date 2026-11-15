import { axios } from "@/dashboard/api/axios";
export const logoutService = async () => {
  await axios.post("session/logout", undefined, { baseURL: "/dashboard/api/" });
};
