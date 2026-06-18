import { fetchClient } from './client';

export const sponsorsApi = {
  getAll: () => fetchClient('/sponsors'),
  getEventSponsors: (eventId: number) => fetchClient(`/sponsors/event/${eventId}`),
  create: (data: Record<string, unknown>) => fetchClient('/sponsors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => fetchClient(`/sponsors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchClient(`/sponsors/${id}`, { method: 'DELETE' })
};
