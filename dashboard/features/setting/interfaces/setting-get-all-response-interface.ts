import { MainType } from '@/dashboard/api/types/main-type'
import { SettingInterface } from './setting-interface'

export interface SettingGetAllResponseInterface extends MainType {
  data: SettingInterface
}
