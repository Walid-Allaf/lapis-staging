export function LinearLoading({ isLoading }: LinearLoadingProps) {
  if (!isLoading) return <div className={"min-h-[4px]"} />

  return (
    <div className={"relative h-1 w-full overflow-hidden bg-muted"}>
      <div className={"absolute left-0 h-full w-1/3 animate-loading-bar bg-primary"} />
    </div>
  )
}

interface LinearLoadingProps {
  isLoading: boolean
}
