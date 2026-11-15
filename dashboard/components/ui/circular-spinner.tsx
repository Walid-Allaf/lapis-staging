import { cn } from '@/dashboard/lib/utils'

type Props = {
  size?: number;          // px
  strokeWidth?: number;   // px
  className?: string;
};

export function CircularSpinner({size = 24, strokeWidth = 3, className}: Props) {
  // border-based spinner (lightweight)
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
      style={{width: size, height: size, borderWidth: strokeWidth}}
      role="status"
      aria-label="Loading"
    />
  )
}
