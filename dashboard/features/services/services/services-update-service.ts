import {  ServicesUpdateRequestInterface } from "../interfaces"
import axios from "@/dashboard/api/axios"
import { servicesEndpoints } from "./services-endpoints"

export const update = async (values: ServicesUpdateRequestInterface) => {
  const response = await axios.put(servicesEndpoints.update(values.id || 0), values)

  return response.data
}
