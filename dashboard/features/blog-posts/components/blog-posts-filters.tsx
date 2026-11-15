import { useState } from 'react'
import { Form, Formik } from 'formik'
import { Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AddButton, IconButton, InputField, RefetchingButton, SectionTitle } from '@/dashboard/components'
import { Card } from '@/dashboard/components/shadcn-ui/card'
import { Grid } from '@/dashboard/components/shadcn-ui/grid'
import { LoadingButton } from '@/dashboard/components/shadcn-ui/loading-button'
import { initialFiltersValues } from '../constants'
import { BlogPostsFiltersRequestInterface } from '../interfaces'

interface FiltersProps {
  submit: (values: BlogPostsFiltersRequestInterface) => void
  onAdd: () => void
  isRefetching: boolean
}

const Filters = ({ submit, onAdd, isRefetching }: FiltersProps) => {
  const { t } = useTranslation()
  const [openFilters, setOpenFilters] = useState<boolean>(false)

  return (
    <Formik<BlogPostsFiltersRequestInterface>
      initialValues={initialFiltersValues}
      onSubmit={submit}
    >
      {({ handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <Card className='p-2 rounded-lg'>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <div className='flex flex-row gap-1 justify-between'>
                  <SectionTitle text={t('blog_posts_title')} />
                  <div className='flex flex-row gap-1 justify-end items-start sm:items-center'>
                    <IconButton icon={<Filter />} label={t('filtering')} handleClick={() => setOpenFilters((prev) => !prev)} />
                    <RefetchingButton isRefetching={isRefetching} handleRefetch={handleSubmit} />
                    <AddButton text={t('blog_posts_add')} onClick={onAdd} />
                  </div>
                </div>
              </Grid>

              {openFilters && (
                <>
                  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <InputField name='search' label={t('blog_posts_filter')} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <LoadingButton type='submit' loading={isRefetching}>
                      {t('filtering')}
                    </LoadingButton>
                  </Grid>
                </>
              )}
            </Grid>
          </Card>
        </Form>
      )}
    </Formik>
  )
}

export default Filters
