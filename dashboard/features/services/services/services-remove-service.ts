import axios from "@/dashboard/api/axios"
import { servicesEndpoints } from "./services-endpoints"

export const remove = async (id: number) => {
  const response = await axios.delete(servicesEndpoints.remove(id))

  return response.data
}
