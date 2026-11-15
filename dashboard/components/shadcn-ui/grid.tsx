import * as React from "react"
import { cn } from "@/dashboard/lib/utils"

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl"
type Span = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Size = Partial<Record<Breakpoint, Span>>
type ResponsiveNumber = number | Partial<Record<Breakpoint, number>>

type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  container?: boolean
  size?: Size

  // MUI-like
  spacing?: ResponsiveNumber
  columnSpacing?: ResponsiveNumber
  rowSpacing?: ResponsiveNumber
}

/* -----------------------
   Static Tailwind maps
------------------------ */

// Keep this list to the values you actually use.
// (You can add 7/9/11/12 etc if needed.)
const GAP: Record<number, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
}

const GAP_X: Record<number, string> = {
  0: "gap-x-0",
  1: "gap-x-1",
  2: "gap-x-2",
  3: "gap-x-3",
  4: "gap-x-4",
  5: "gap-x-5",
  6: "gap-x-6",
  8: "gap-x-8",
  10: "gap-x-10",
  12: "gap-x-12",
}

const GAP_Y: Record<number, string> = {
  0: "gap-y-0",
  1: "gap-y-1",
  2: "gap-y-2",
  3: "gap-y-3",
  4: "gap-y-4",
  5: "gap-y-5",
  6: "gap-y-6",
  8: "gap-y-8",
  10: "gap-y-10",
  12: "gap-y-12",
}

const BP = {
  sm: "sm:",
  md: "md:",
  lg: "lg:",
  xl: "xl:",
} as const

function pick(map: Record<number, string>, n?: number, fallback: string = "") {
  if (n == null) return ""
  return map[n] ?? fallback
}

function responsiveAxisClasses(
  kind: "gap" | "gap-x" | "gap-y",
  value?: ResponsiveNumber,
  fallbackClass: string = ""
): string {
  if (value == null) return ""

  const baseMap = kind === "gap" ? GAP : kind === "gap-x" ? GAP_X : GAP_Y

  if (typeof value === "number") {
    return pick(baseMap, value, fallbackClass)
  }

  const parts: string[] = []

  // xs (no prefix)
  if (value.xs != null) parts.push(pick(baseMap, value.xs, fallbackClass))

  // sm/md/lg/xl (prefixed)
  if (value.sm != null) parts.push(`${BP.sm}${pick(baseMap, value.sm).replace(kind, kind)}`)
  if (value.md != null) parts.push(`${BP.md}${pick(baseMap, value.md).replace(kind, kind)}`)
  if (value.lg != null) parts.push(`${BP.lg}${pick(baseMap, value.lg).replace(kind, kind)}`)
  if (value.xl != null) parts.push(`${BP.xl}${pick(baseMap, value.xl).replace(kind, kind)}`)

  return parts.join(" ")
}

function spacingToContainerClasses(opts: {
  spacing?: ResponsiveNumber
  columnSpacing?: ResponsiveNumber
  rowSpacing?: ResponsiveNumber
}) {
  const { spacing, columnSpacing, rowSpacing } = opts

  // If spacing exists and axis spacings are not provided, use spacing for both axes.
  // If axis spacings are provided, they override their axis.
  const hasAxis = columnSpacing != null || rowSpacing != null

  const gapBoth = !hasAxis ? responsiveAxisClasses("gap", spacing, "gap-2") : ""
  const gapX = responsiveAxisClasses("gap-x", columnSpacing ?? spacing, "gap-x-2")
  const gapY = responsiveAxisClasses("gap-y", rowSpacing ?? spacing, "gap-y-2")

  // If no spacing provided at all, default to gap-0 like MUI spacing={0}.
  const anySpacing = spacing != null || columnSpacing != null || rowSpacing != null
  const fallback = anySpacing ? "" : "gap-0"

  return cn(fallback, gapBoth, gapX, gapY).trim()
}

/* -----------------------
   Size (12-col) classes
------------------------ */

const COL_SPAN: Record<Span, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
}

const SM_COL_SPAN: Record<Span, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  6: "sm:col-span-6",
  7: "sm:col-span-7",
  8: "sm:col-span-8",
  9: "sm:col-span-9",
  10: "sm:col-span-10",
  11: "sm:col-span-11",
  12: "sm:col-span-12",
}

const MD_COL_SPAN: Record<Span, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
}

const LG_COL_SPAN: Record<Span, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
}

const XL_COL_SPAN: Record<Span, string> = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  5: "xl:col-span-5",
  6: "xl:col-span-6",
  7: "xl:col-span-7",
  8: "xl:col-span-8",
  9: "xl:col-span-9",
  10: "xl:col-span-10",
  11: "xl:col-span-11",
  12: "xl:col-span-12",
}

function sizeToClasses(size?: Size) {
  if (!size) return "col-span-12"

  const classes: string[] = []

  // xs default
  classes.push(size.xs != null ? COL_SPAN[size.xs] : "col-span-12")

  if (size.sm != null) classes.push(SM_COL_SPAN[size.sm])
  if (size.md != null) classes.push(MD_COL_SPAN[size.md])
  if (size.lg != null) classes.push(LG_COL_SPAN[size.lg])
  if (size.xl != null) classes.push(XL_COL_SPAN[size.xl])

  return classes.join(" ")
}

export function Grid({
                       container,
                       size,
                       spacing,
                       columnSpacing,
                       rowSpacing,
                       className,
                       ...props
                     }: GridProps) {
  const base = container
    ? cn("grid grid-cols-12", spacingToContainerClasses({ spacing, columnSpacing, rowSpacing }))
    : sizeToClasses(size)

  return <div className={cn(base, className)} {...props} />
}
