export type YouTubeGalleriesOpenCreateUpdateInterface = {
  onClose: (refresh?: boolean) => void
  open: {
    isOpen: boolean
    isAdd: boolean
    youtubeGalleriesId: number
  }
}
