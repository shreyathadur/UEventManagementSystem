import { fetchClient } from './client';

export const checkinsApi = {
  scanTicket: (data: { ticketCode: string }) => fetchClient('/checkins/scan', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
