import { Alert, AlertDescription, AlertTitle } from '@/dashboard/components/shadcn-ui/alert'

export function ErrorMassage({error = 'حدث خطأ ما'}: ErrorTextProps) {
  return (
    <Alert variant="destructive" className="border-destructive bg-destructive/5">
      <AlertTitle>خطأ</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

interface ErrorTextProps {
  error?: string
}
