export function SectionSubtitle({text}: Text) {
  return (
    <h3 className={'text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-bold'}>
      {text}
    </h3>
  )
}

interface Text {
  text: string
}
