const prefix = "Services"

export const servicesEndpoints = {
    getAll: prefix + '/get-all',
    getById: (id: number) => prefix + `/get-by-id/${id}`,
    add: prefix + '/add',
    update: (id: number) => prefix + `/edit/${id}`,
    remove: (id: number) => prefix + `/delete/${id}`
}
