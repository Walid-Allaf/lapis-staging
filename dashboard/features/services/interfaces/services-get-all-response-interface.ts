import {ServicesInterface} from "./services-interface"
import {MainType} from "@/dashboard/api/types/main-type"

export interface ServicesGetAllResponseInterface extends MainType {
    data: ServicesInterface[]
}
