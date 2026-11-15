export type GalleryOpenCreateUpdateInterface = {
  onClose: (refresh?: boolean) => void
  open: {
    isOpen: boolean
    isAdd: boolean
    galleryId: number
  }
}
