import { axios } from "@/dashboard/api/axios";
import { LoginResponse } from "@/dashboard/stores/use-auth-store";
import { LoginRequestInterface } from "../interfaces";

export const loginService = async (data: LoginRequestInterface):Promise<LoginResponse> => {
  const result = await axios.post<LoginResponse>("session/login", data, { baseURL: "/dashboard/api/" });
  return result.data;
};
