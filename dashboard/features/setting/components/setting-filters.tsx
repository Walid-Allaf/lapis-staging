import { IconButton, RefetchingButton, SectionTitle } from '@/dashboard/components'
import { Grid } from '@/dashboard/components/shadcn-ui/grid'
import { Card } from '@/dashboard/components/shadcn-ui/card'

import { Lock, Unlock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const SettingsFilters = ({isEditEnabled, toggleIsEditEnabled, isRefetching, handleSubmit}: FiltersProps) => {
  const {t} = useTranslation()
  return (
    <Card className={'p-2 rounded-lg'}>
      <Grid container spacing={2}>
        <Grid size={{xs: 12}}>
          <div className={'flex flex-row gap-1 justify-between'}>
            <SectionTitle text={t('settings_page_title')}/>
            <div className={'flex flex-row gap-1 justify-end items-start sm:items-center'}>
              <IconButton
                type="button"
                variant={isEditEnabled ? 'outline' : 'default'}
                label={'toggleIsEditEnabled'}
                handleClick={toggleIsEditEnabled}
                icon={isEditEnabled ? (
                  <Lock className="size-4"/>
                ) : (
                  <Unlock className="size-4"/>
                )}
              />
              <RefetchingButton isRefetching={isRefetching} handleRefetch={handleSubmit}/>
            </div>
          </div>
        </Grid>

      </Grid>
    </Card>
  )
}

interface FiltersProps {
  toggleIsEditEnabled: () => void
  isEditEnabled: boolean
  isRefetching: boolean
  handleSubmit: () => void
}
