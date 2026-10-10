import { Turno } from '../models/turno'

const url = 'https://jsonplaceholder.typicode.com/users'

export const turnosService = {
  getAll: async (): Promise<Turno[]> => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP network error code: ${response.status}`)
    const data = await response.json()
    
    return data.map((item: any) => ({
      id: String(item.id),
      name: item.name || '',
      phone: item.phone || '',
    }))
  },

  add: async (turno: Omit<Turno, 'id'>): Promise<Turno> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turno),
    })
    const data = await response.json()
    return { ...turno, id: String(data.id) }
  },

  update: async (turno: Turno): Promise<Turno> => {
    const response = await fetch(`${url}/${turno.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turno),
    })
    const data = await response.json()
    return { ...turno, ...data, id: String(turno.id) }
  },

  delete: async (id: string): Promise<boolean> => {
    const response = await fetch(`${url}/${id}`, {
      method: 'DELETE',
    })
    return response.ok
  }
}