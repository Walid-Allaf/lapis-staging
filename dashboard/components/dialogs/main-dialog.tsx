import { Form, Formik, FormikValues, type FormikProps, type FormikConfig } from 'formik'
import { toast } from 'sonner'
import { CloseDialog, SectionSubtitle } from '@/dashboard/components'
import { LoadingButton } from '@/dashboard/components/shadcn-ui/loading-button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/dashboard/components/shadcn-ui/dialog'
import { cn } from '@/dashboard/lib/utils'
import { useTranslation } from 'react-i18next'

export function MainDialog<T extends FormikValues>(props: GenericDialogProps<T>) {
  const {
    open, onClose, state, initialValues, validationSchema, handleCreate, handleUpdate, id, children, onSuccessCreate, onSuccessUpdate, onErrorCreate, onErrorUpdate, maxWidth = 'sm', dialogTitle, dialogDescription, isRefetching = false, hideActions = false
  }
    = props
  // useUnloadConfirmation(true)
  const { t } = useTranslation()
  return (
    <Dialog open={open}>
      <Formik<T>
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          const promise = state === 'add'
            ? handleCreate(values)
              .then((res) => {
                if (onSuccessCreate) onSuccessCreate(res)
                onClose(true)
              })
              .catch((err) => { if (onErrorCreate) onErrorCreate(err) })
            : id !== undefined
              ? handleUpdate({ ...values, id })
                .then((res) => {
                  if (onSuccessUpdate) onSuccessUpdate(res)
                  onClose(true)
                })
                .catch((err) => { if (onErrorUpdate) onErrorUpdate(err) })
              : Promise.reject(new Error('Invalid update operation'))

          toast.promise(promise, {
            loading: state === 'add' ? 'جاري الإضافة...' : 'جاري التعديل...',
            success: () => {
              setSubmitting(false)
              return state === 'add' ? 'تم الإضافة بنجاح' : 'تم التعديل بنجاح'
            },
            error: (err) => {
              setSubmitting(false)
              return err?.response?.data?.message || 'حدث خطأ ما'
            }
          })
        }}
      >
        {({ handleSubmit, errors, touched, dirty, isSubmitting, values, setFieldValue }) => (
          <DialogContent
            showCloseButton={false}
            className={cn(
              'z-[100] py-4 px-0 max-h-[90vh] flex flex-col',
              maxWidthClasses[maxWidth]
            )}
          >
            <Form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
              <DialogHeader className={'gap-0 pb-3 px-6 flex-shrink-0'}>
                <DialogTitle asChild>
                  <div className={'flex items-center justify-between'}>
                  <SectionSubtitle text={dialogTitle ? dialogTitle : state === 'add' ? 'إضافة عنصر' : 'تعديل عنصر'} />
                  <CloseDialog onClose={() => onClose(false)} type="icon" dirty={dirty} />
                  </div>
                </DialogTitle>
                <DialogDescription className={'text-start'}>
                  {dialogDescription ? dialogDescription : state === 'add' ? 'يمكنك إضافة معلومات العنصر من هنا' : 'يمكنك تعديل معلومات العنصر من هنا'}
                </DialogDescription>
              </DialogHeader>
              <div className={'overflow-y-auto px-6 py-2'}>
                {children({ values, errors, touched, dirty, isSubmitting, setFieldValue })}
              </div>
              {hideActions ?
                null :
                <DialogFooter className={'pt-3 px-6 flex-shrink-0'}>
                  <div className={'flex gap-1 justify-end'}>
                    <CloseDialog onClose={() => onClose(false)} type={'button'} dirty={dirty} />
                    <LoadingButton
                      loading={isSubmitting}
                      variant="default"
                      type="submit"
                      size={'sm'}
                      disabled={isRefetching}
                    >
                      {t('save')}
                    </LoadingButton>
                  </div>
                </DialogFooter>
              }
            </Form>
          </DialogContent>
        )}
      </Formik>
    </Dialog>
  )
}

interface GenericDialogProps<T extends FormikValues> {
  open: boolean
  onClose: (refresh: boolean) => void
  state: 'add' | 'edit'
  initialValues: T
  validationSchema?: FormikConfig<T>['validationSchema']
  handleCreate: (data: T) => Promise<void>
  handleUpdate: (data: T) => Promise<void>
  id?: string | number | undefined | null
  children: (props: Pick<FormikProps<T>, 'isSubmitting' | 'errors' | 'touched' | 'dirty' | 'setFieldValue' | 'values'>) => React.JSX.Element
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  dialogTitle?: string
  dialogDescription?: string
  onSuccessCreate?: (res: unknown) => void
  onErrorCreate?: (err: unknown) => void
  onSuccessUpdate?: (res: unknown) => void
  onErrorUpdate?: (err: unknown) => void
  isRefetching?: boolean
  hideActions?: boolean
}

// Width mapping for maxWidth prop
const maxWidthClasses = {
  xs: '!max-w-xs',
  sm: '!max-w-sm',
  md: '!max-w-md',
  lg: '!max-w-lg',
  xl: '!max-w-xl',
  '2xl': '!max-w-2xl',
  '3xl': '!max-w-3xl',
  '4xl': '!max-w-4xl',
  '5xl': '!max-w-5xl',
  '6xl': '!max-w-6xl',
  '7xl': '!max-w-7xl',
  full: '!max-w-full'
}
