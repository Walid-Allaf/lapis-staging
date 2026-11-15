import { SettingUpdateRequestInterface } from "../interfaces"
import axios from "@/dashboard/api/axios"
import { SettingEndpoints } from "./setting-endpoints"

export const update = async (values: SettingUpdateRequestInterface) => {
  const response = await axios.put(SettingEndpoints.update, values)

  return response.data
}
