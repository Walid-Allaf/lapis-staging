export type BlogPostsOpenCreateUpdateInterface = {
  onClose: (refresh?: boolean) => void
  open: {
    isOpen: boolean
    isAdd: boolean
    blogPostsId: number
  }
}
