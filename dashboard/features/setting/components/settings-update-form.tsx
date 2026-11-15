import React from 'react'
import { InputField, SwitchField } from '@/dashboard/components'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/dashboard/components/shadcn-ui/separator'
import { Button } from '@/dashboard/components/shadcn-ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/dashboard/components/shadcn-ui/card'
import { useFormikContext } from 'formik'

export const SettingsUpdateForm: React.FC<SettingsUpdateFormProps> = ({ isEditEnabled }): React.JSX.Element => {
  const { t } = useTranslation()
  const { isSubmitting, dirty, isValid } = useFormikContext()

  return (
    <div>
      <Section title={t('settings_contact_section')}>
        <div className='space-y-3'>
          <InputField name='phoneNumber' label={t('settings_phone_number')} dir='ltr' disabled={!isEditEnabled} />
          <InputField name='email' label={t('settings_email')} dir='ltr' disabled={!isEditEnabled} />
          <InputField name='address' label={t('settings_address')} dir='rtl' disabled={!isEditEnabled} />
        </div>
      </Section>

      <Section title={t('settings_location_section')}>
        <div className='grid gap-3 md:grid-cols-2'>
          <InputField
            name='latitude'
            label={t('settings_latitude')}
            type='number'
            dir='ltr'
            inputMode='decimal'
            min={-90}
            max={90}
            props={{ step: 'any' }}
            disabled={!isEditEnabled}
          />
          <InputField
            name='longitude'
            label={t('settings_longitude')}
            type='number'
            dir='ltr'
            inputMode='decimal'
            min={-180}
            max={180}
            props={{ step: 'any' }}
            disabled={!isEditEnabled}
          />
        </div>
      </Section>

      <Section title={t('settings_about_us_section')}>
        <div className='space-y-3'>
          <InputField name='aboutUs_Ar' label={t('settings_about_us_ar')} component='textarea' dir='rtl' disabled={!isEditEnabled} />
          <InputField name='aboutUs_En' label={t('settings_about_us_en')} component='textarea' dir='ltr' align='end' disabled={!isEditEnabled} />
          <Separator />
          <InputField name='contactUs_Ar' label={t('settings_contact_us_ar')} component='textarea' dir='rtl' disabled={!isEditEnabled} />
          <InputField name='contactUs_En' label={t('settings_contact_us_en')} component='textarea' dir='ltr' align='end' disabled={!isEditEnabled} />
        </div>
      </Section>

      <Section title={t('settings_tab_social')}>
        <div className='space-y-5'>
          <InputField name='facebookUrl' label={t('settings_social_facebook')} dir='ltr' disabled={!isEditEnabled} />
          <Separator />
          <InputField name='instagramUrl' label={t('settings_social_instagram')} dir='ltr' disabled={!isEditEnabled} />
          <Separator />
          <InputField name='twitterUrl' label={t('settings_social_twitter')} dir='ltr' disabled={!isEditEnabled} />
          <Separator />
          <InputField name='youtubeUrl' label={t('settings_social_youtube')} dir='ltr' disabled={!isEditEnabled} />
          <Separator />
          <InputField name='tiktokUrl' label={t('settings_social_tiktok')} dir='ltr' disabled={!isEditEnabled} />
        </div>
      </Section>

      <Section title={t('settings_tabs_visibility_section')}>
        <div className='grid gap-4 md:grid-cols-2'>
          <SwitchField name='servicesTabToggle' label={t('settings_services_tab_toggle')} disabled={!isEditEnabled} />
          <SwitchField name='faQsTabToggle' label={t('settings_faqs_tab_toggle')} disabled={!isEditEnabled} />
          <SwitchField name='galleriesTabToggle' label={t('settings_galleries_tab_toggle')} disabled={!isEditEnabled} />
          <SwitchField name='youTubeGalleriesTabToggle' label={t('settings_youtube_galleries_tab_toggle')} disabled={!isEditEnabled} />
          <SwitchField name='testimonialsTabToggle' label={t('settings_testimonials_tab_toggle')} disabled={!isEditEnabled} />
          <SwitchField name='ourSpecialistsTabToggle' label={t('settings_our_specialists_tab_toggle')} disabled={!isEditEnabled} />
        </div>
      </Section>

      {isEditEnabled && (
        <div className='flex justify-end gap-3'>
          <Button
            type='submit'
            className='font-semibold px-8'
            disabled={isSubmitting || !isValid || !dirty}
          >
            {isSubmitting ? t('settings_saving') : t('settings_save_changes')}
          </Button>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className='mb-5 shadow-sm gap-1'>
      <CardHeader className='pb-3! px-5 border-b border-border'>
        <CardTitle className='text-sm font-semibold text-foreground tracking-wide uppercase'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='px-5 py-4'>{children}</CardContent>
    </Card>
  )
}

interface SettingsUpdateFormProps {
  isEditEnabled: boolean
}
