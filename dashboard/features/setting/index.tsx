import React, { useState } from 'react'
import { ErrorMassage, FormLoading, MainContainer } from '@/dashboard/components'
import { SettingsFilters, SettingsUpdateForm } from './components'
import { SettingFormInterface } from './interfaces'
import { useSetting, useSettingUpdate } from './hooks'
import { SettingSchema } from './validation'
import { Form, Formik } from 'formik'

const initialSettingValues: SettingFormInterface = {
  phoneNumber: '',
  email: '',
  address: '',
  latitude: 0,
  longitude: 0,
  aboutUs_Ar: '',
  aboutUs_En: '',
  contactUs_Ar: '',
  contactUs_En: '',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  faQsTabToggle: true,
  servicesTabToggle: true,
  galleriesTabToggle: true,
  youTubeGalleriesTabToggle: true,
  testimonialsTabToggle: true,
  ourSpecialistsTabToggle: true
}

export const Settings: React.FC = (): React.JSX.Element => {
  const { dataAll, isLoading, refetch, isRefetching, isError } = useSetting()
  const { handleUpdate } = useSettingUpdate()
  const [isEditEnabled, setIsEditEnabled] = useState(false)

  const initialValues: SettingFormInterface = {
    ...initialSettingValues,
    ...dataAll?.data
  }

  return (
    <MainContainer>
      {isError && <ErrorMassage />}
      <div className='p-2'>
        <SettingsFilters
          isRefetching={isRefetching}
          toggleIsEditEnabled={() => setIsEditEnabled(!isEditEnabled)}
          isEditEnabled={isEditEnabled}
          handleSubmit={async function (): Promise<void> {
            refetch()
          }}
        />
      </div>
      {isLoading ? (
        <div className='grid'>
          <FormLoading height='75vh' />
        </div>
      ) : (
        <div className='px-2 pb-2'>
          <Formik<SettingFormInterface>
            initialValues={initialValues}
            validationSchema={SettingSchema}
            enableReinitialize
            onSubmit={(values, { setSubmitting }) => {
              handleUpdate(values)
                .then(() => {
                  refetch()
                  setIsEditEnabled(false)
                })
                .finally(() => setSubmitting(false))
            }}
          >
            {() => (
              <Form className='space-y-0'>
                <SettingsUpdateForm isEditEnabled={isEditEnabled} />
              </Form>
            )}
          </Formik>
        </div>
      )}
    </MainContainer>
  )
}
