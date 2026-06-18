import { fetchClient } from './client';

export const eventsApi = {
  getAll: () => fetchClient('/events'),
  getById: (id: string | number) => fetchClient(`/events/${id}`),
  create: (data: Record<string, unknown>) => fetchClient('/events', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: string | number, data: Record<string, unknown>) => fetchClient(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: string | number) => fetchClient(`/events/${id}`, {
    method: 'DELETE'
  })
};
