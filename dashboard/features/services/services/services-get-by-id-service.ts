import { axios } from "@/dashboard/api/axios"
import type { ServicesInterface } from "../interfaces"
import { servicesEndpoints } from "./services-endpoints"

export const getById = async (id: number): Promise<ServicesInterface> => {
  const result = await axios.get(servicesEndpoints.getById(id))

  return result.data.data
}
