export const openFullscreenMode = () => {
  if (typeof document === 'undefined') return
  const elem = document.documentElement
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  }
}

export const closeFullscreenMode = () => {
  if (typeof document === 'undefined') return
  if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

export const getPageSize = (): number => {
  if (typeof window === 'undefined') return 50
  const pageSize: number = Number(localStorage.getItem('perPage'))
  if (!pageSize) {
    setPageSize(50)
  }
  return pageSize || 50
}

export const setPageSize = (pageSize: number): void => {
  if (typeof window === 'undefined') return
  setPageNumber(0)
  localStorage.setItem('perPage', pageSize.toString())
}

export const getPageNumber = (): number => {
  if (typeof window === 'undefined') return 1
  const pageNumber: number = Number(localStorage.getItem('page'))
  if (!pageNumber) {
    setPageNumber(1)
  }
  return pageNumber || 1
}

export const setPageNumber = (page: number): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('page', page.toString())
}
