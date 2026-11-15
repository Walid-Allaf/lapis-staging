import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/dashboard/api/upload-limits"
import { getAssetUrl } from '@/dashboard/api/urls'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { PDFImage } from '@/dashboard/assets'
import { FormLabel } from '@/dashboard/components'
import { FormikValues, getIn, useField, useFormikContext } from 'formik'
import { Button } from '@/dashboard/components/shadcn-ui/button'
import { Dialog, DialogContent } from '@/dashboard/components/shadcn-ui/dialog'
import { Eye, ImageUp, Loader2, X } from 'lucide-react'
import { cn } from '@/dashboard/lib/utils'
import { useTranslation } from 'react-i18next'
import axios from '@/dashboard/api/axios'

interface UploadFileResponse {
  isSuccess: boolean
  data: {
    fileId: number
    filePath: string
  } | null
  error: string | null
  paging: unknown
}

const resolvePreviewSrc = getAssetUrl

export function ImageUpload(
  {
    name,
    label,
    accept,
    previewUrl,
    onChange,
    canDelete = false,
    showErrorMessage = true,
    disabled = false
  }: ImageUploadComponentProps
) {
  const { t } = useTranslation()
  const {
    setFieldValue,
    setFieldTouched,
    touched,
    errors
  } = useFormikContext<FormikValues>()

  const [field] = useField(name)

  const [newImage, setNewImage] = useState<string>('')
  const [previewOpen, setPreviewOpen] = useState<boolean>(false)
  const [fileError, setFileError] = useState<string>('')
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const image = field.value || ''
  const fieldError = getIn(errors, name)
  const fieldTouched = getIn(touched, name)
  const hasFormikError = Boolean(fieldError) && Boolean(fieldTouched)
  const hasError = Boolean(fileError) || hasFormikError

  const previewSrc =
    newImage ||
    resolvePreviewSrc(uploadedPreviewUrl) ||
    resolvePreviewSrc(previewUrl) ||
    (typeof image === 'string' ? resolvePreviewSrc(image) : '')

  const hasPreview = Boolean(previewSrc)

  const isPDF = useMemo(
    () =>
      (newImage && newImage.includes('/pdf')) ||
      (previewSrc && previewSrc.toLowerCase().endsWith('.pdf')) ||
      (image && typeof image === 'object' && 'type' in image && (image as File).type === 'application/pdf'),
    [newImage, previewSrc, image]
  )

  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post<UploadFileResponse>('FileUpload/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.error || 'upload_failed')
    }

    return response.data.data
  }

  useEffect(
    () => {
      if (!image || typeof image !== 'object') return
      if (!('size' in image) || !('type' in image)) return

      const file = image as File
      const reader = new FileReader()

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setNewImage(String(e.target.result))
        }
      }

      reader.onerror = () => {
        console.error('Error reading file')
      }

      reader.readAsDataURL(file)

      return () => {
        try {
          reader.abort()
        } catch {
          // ignore
        }
      }
    },
    [image]
  )

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled || isUploading) return

    const fileSizeLimitMB = MAX_UPLOAD_MB
    const file = event.target.files?.[0]

    if (!file) return


    if (file.size > MAX_UPLOAD_BYTES) {
      setFileError(`حجم الصورة أكبر من ${fileSizeLimitMB}MB`)
      setNewImage('')
      setUploadedPreviewUrl('')
      setFieldTouched(name, true, true)
      event.target.value = ''
      return
    }

    setFileError('')
    setFieldTouched(name, true, true)

    const reader = new FileReader()

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setNewImage(String(e.target.result))
      }
    }

    reader.readAsDataURL(file)

    try {
      setIsUploading(true)
      const uploadedFile = await uploadImage(file)

      setFieldValue(name, uploadedFile.fileId)
      setUploadedPreviewUrl(uploadedFile.filePath)
      onChange?.(uploadedFile.fileId, uploadedFile.filePath, file)
    } catch (error) {
      setNewImage('')
      setUploadedPreviewUrl('')
      setFieldValue(name, null)
      setFileError(error instanceof Error ? error.message : 'upload_failed')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const togglePreview = () => setPreviewOpen(true)
  const closePreview = () => setPreviewOpen(false)

  return (
    <div className='flex flex-col flex-1'>
      <FormLabel
        title={label}
        error={hasError}
      />

      <div
        className={cn(
          'relative w-full h-[150px] overflow-hidden rounded-[10px] border-2 border-dashed',
          'flex items-center',
          hasPreview ? 'justify-end' : 'justify-center',
          'bg-muted/50',
          hasError ? 'border-destructive' : 'border-primary',
          (disabled || isUploading) && 'opacity-60 cursor-not-allowed'
        )}
      >
        {hasPreview && (
          <>
            <Button
              type='button'
              variant='outline'
              disabled={!previewSrc}
              className={cn(
                'absolute z-[99] top-[5px] right-[5px]',
                'h-8 w-8 p-0 rounded-md',
                hasError ? 'border-destructive' : 'border-primary'
              )}
              onClick={togglePreview}
            >
              <Eye
                className={cn(
                  'h-4 w-4',
                  hasError ? 'text-destructive' : 'text-primary'
                )}
              />
            </Button>

            {canDelete && !disabled && !isUploading && (
              <Button
                type='button'
                variant='outline'
                className={cn(
                  'absolute z-[99] bottom-[5px] right-[5px]',
                  'h-8 w-8 p-0 rounded-md border-destructive'
                )}
                onClick={() => {
                  setFieldValue(name, null)
                  setNewImage('')
                  setUploadedPreviewUrl('')
                  setFileError('')
                  setFieldTouched(name, true, true)
                  onChange?.(null, null)
                }}
              >
                <X className='h-4 w-4 text-destructive' />
              </Button>
            )}
          </>
        )}

        {hasPreview && (
          <img
            src={isPDF ? PDFImage : previewSrc}
            alt='Uploaded'
            className='w-full h-full object-contain'
          />
        )}

        {!hasPreview && (
          <div className='flex flex-col items-center'>
            <ImageUp size={40} />
            <p className='px-1 text-center text-muted-foreground text-[12px]'>
              {'قم بسحب وافلات الصورة هنا، أو اضغط لاختيار صورة'}
            </p>
          </div>
        )}

        {isUploading && (
          <div className='absolute inset-0 z-[90] flex items-center justify-center bg-background/60'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        )}

        {!disabled && !isUploading && (
          <input
            type='file'
            accept={accept}
            className={cn(
              'absolute top-0 left-1/2 -translate-x-1/2',
              'w-full h-full opacity-0 cursor-pointer'
            )}
            onChange={handleImageChange}
          />
        )}
      </div>

      {showErrorMessage && (
        <>
          {fileError && (
            <p className='text-sm text-destructive mt-1'>
              {fileError}
            </p>
          )}

          {!fileError && hasFormikError && (
            <p className='text-sm text-destructive mt-1'>
              {t(String(fieldError))}
            </p>
          )}
        </>
      )}

      <Dialog
        open={previewOpen}
        onOpenChange={(v) => {
          if (!v) closePreview()
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={cn(
            'z-[200]',
            'min-w-screen w-screen h-screen',
            'p-0 border-0 shadow-none bg-transparent'
          )}
        >
          <Button
            type='button'
            variant='destructive'
            size='icon'
            onClick={closePreview}
            className={cn(
              'absolute top-10 right-5 z-[99]',
              'h-[30px] w-[30px] rounded-full'
            )}
          >
            <X className='h-4 w-4' />
          </Button>

          {!isPDF && (
            <img
              src={previewSrc}
              alt='Preview'
              className='absolute top-0 left-0 w-full h-full object-contain'
            />
          )}

          {isPDF && (
            <iframe
              src={previewSrc}
              title='PDF Viewer'
              width='100%'
              height='100%'
              className='border-0'
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ImageUploadComponentProps {
  name: string
  label: string
  accept: string
  previewUrl?: string | null
  onChange?: (fileId: number | null, filePath?: string | null, file?: File) => void
  canDelete?: boolean
  showErrorMessage?: boolean
  disabled?: boolean
}
