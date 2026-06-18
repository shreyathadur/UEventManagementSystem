import { fetchClient, API_BASE } from './client';

export const certificatesApi = {
  getMyCertificates: () => fetchClient('/certificates/my'),
  claimCertificate: (eventId: number) => fetchClient(`/certificates/claim?eventId=${eventId}`, { method: 'POST' }),
  getDownloadUrl: (certId: number) => `${API_BASE}/certificates/${certId}/download`
};
