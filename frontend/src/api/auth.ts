import { fetchClient } from './client';

export const authApi = {
  login: (data: Record<string, unknown>) => fetchClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  register: (data: Record<string, unknown>) => fetchClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
