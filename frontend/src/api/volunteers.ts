import { fetchClient } from './client';

export const volunteersApi = {
  apply: (eventId: number, requestedRole: string) => fetchClient(`/volunteers/apply?eventId=${eventId}&requestedRole=${encodeURIComponent(requestedRole)}`, { method: 'POST' }),
  getMyTasks: () => fetchClient('/volunteers/my-tasks'),
  getAdminList: () => fetchClient('/volunteers/admin/list'),
  reviewApplication: (id: number, data: { status: string; assignedRole?: string; assignedTasks?: string }) => fetchClient(`/volunteers/admin/review/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  logHours: (id: number, data: { hoursWorked: number; performanceRating?: number }) => fetchClient(`/volunteers/admin/log/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};
