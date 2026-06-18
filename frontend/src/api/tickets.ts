import { fetchClient } from './client';

export const ticketsApi = {
  getMyTickets: () => fetchClient('/tickets/my'),
  bookTicket: (eventId: number) => fetchClient(`/tickets/book?eventId=${eventId}`, { method: 'POST' }),
  getQrCode: (ticketId: number) => fetchClient(`/tickets/${ticketId}/qrcode`)
};
