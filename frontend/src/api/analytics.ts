import { fetchClient } from './client';

export const analyticsApi = {
  getOverview: () => fetchClient('/analytics/overview')
};
