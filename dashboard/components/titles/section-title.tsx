export function SectionTitle({ text }: Text) {
  return (
    <h2 className={'text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-bold'}>
      {text}
    </h2>
  )
}

interface Text {
  text: string
}
