export type FaqsOpenCreateUpdateInterface = {
  onClose: (refresh?: boolean) => void
  open: {
    isOpen: boolean
    isAdd: boolean
    faqsId: number
  }
}
