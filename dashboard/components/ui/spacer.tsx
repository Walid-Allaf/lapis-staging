export function Spacer({space}: Space) {
  return (
    <div
      className={'block h-px w-full'}
      style={{
        marginTop: space,
        marginBottom: space
      }}
    />
  )
}

interface Space {
  space: number
}
