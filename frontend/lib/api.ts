import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Availability Schedules
export const schedulesAPI = {
  getAll: () => api.get('/availability-schedules'),
  getById: (id: string) => api.get(`/availability-schedules/${id}`),
  create: (data: any) => api.post('/availability-schedules', data),
  delete: (id: string) => api.delete(`/availability-schedules/${id}`),
};

// Availability Slots
export const slotsAPI = {
  getAll: (scheduleId?: string) => 
    api.get('/availability-slots', { params: scheduleId ? { schedule_id: scheduleId } : {} }),
  create: (data: any) => api.post('/availability-slots', data),
  delete: (id: string) => api.delete(`/availability-slots/${id}`),
};

// Event Types
export const eventTypesAPI = {
  getAll: () => api.get('/events'),
  getBySlug: (slug: string) => api.get(`/public/events/${slug}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Bookings
export const bookingsAPI = {
  getUpcoming: () => api.get('/bookings/upcoming'),
  getPast: () => api.get('/bookings/past'),
  cancel: (id: string) => api.post(`/bookings/${id}/cancel`),
};

// Public
export const publicAPI = {
  getEvent: (slug: string) => api.get(`/public/events/${slug}`),
  getSlots: (slug: string, date: string) => 
    api.get(`/public/slots?slug=${slug}&date=${date}`),
  book: (data: any) => api.post('/public/book', data),
};
