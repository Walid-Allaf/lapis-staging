import axios from "@/dashboard/api/axios"
import { SettingEndpoints } from "./setting-endpoints"
import { SettingGetAllResponseInterface } from "../interfaces"

export const getAll = async (): Promise<SettingGetAllResponseInterface> => {
  const response = await axios.get(SettingEndpoints.get)
  return response.data
}
