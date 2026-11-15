import { ServicesCreateRequestInterface } from "../interfaces/index"
import axios from "@/dashboard/api/axios"
import { servicesEndpoints } from "./services-endpoints"

export const create = async (values: ServicesCreateRequestInterface) => {
  const response = await axios.post(servicesEndpoints.add, values)

  return response.data
}
