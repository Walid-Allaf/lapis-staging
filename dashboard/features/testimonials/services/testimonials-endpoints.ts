const prefix = 'Testimonials'

export const testimonialsEndpoints = {
  getAll: prefix + '/get-all',
  getById: (id: number) => prefix + `/get-by-id/${id}`,
  add: prefix + '/add',
  update: (id: number) => prefix + `/edit/${id}`,
  remove: (id: number) => prefix + `/delete/${id}`
}
