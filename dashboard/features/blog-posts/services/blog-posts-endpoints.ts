const prefix = 'BlogPosts'

export const blogPostsEndpoints = {
  getAll: prefix + '/get-all',
  getById: (id: number) => prefix + `/get-by-id/${id}`,
  getBySlug: (slug: string) => prefix + `/by-slug/${slug}`,
  add: prefix + '/add',
  update: (id: number) => prefix + `/edit/${id}`,
  remove: (id: number) => prefix + `/delete/${id}`
}
