import { CircularSpinner } from "./circular-spinner"
import { useEffect, useState } from "react"

interface FormLoadingProps {
  height?: string
  timeout?: number // بالـ ms — default ثانيتين
}

export function FormLoading({ height = "110px", timeout = 10000 }: FormLoadingProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), timeout)
    return () => clearTimeout(timer)
  }, [timeout])

  if (!visible) return null

  return (
    <div className="grid place-items-center" style={{ height }}>
      <CircularSpinner />
    </div>
  )
}