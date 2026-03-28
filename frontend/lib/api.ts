import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event Types
export const eventTypesAPI = {
  getAll: () => api.get('/events'),
  getBySlug: (slug: string) => api.get(`/public/events/${slug}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Availability
export const availabilityAPI = {
  getAll: () => api.get('/availability'),
  create: (data: any) => api.post('/availability', data),
};

// Bookings
export const bookingsAPI = {
  getUpcoming: () => api.get('/bookings/upcoming'),
  getPast: () => api.get('/bookings/past'),
  cancel: (id: string) => api.post(`/bookings/${id}/cancel`),
};

// Public
export const publicAPI = {
  getSlots: (slug: string, date: string) => 
    api.get(`/public/slots?slug=${slug}&date=${date}`),
  createBooking: (data: any) => api.post('/public/book', data),
};
