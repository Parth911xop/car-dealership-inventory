import api from './client';
import type { Vehicle } from '../types';

export const authApi = {
  register: (email: string, password: string) =>
    api.post('/api/auth/register', { email, password }),

  login: (email: string, password: string) =>
    api.post<{ token: string; user: { id: string; email: string; role: string } }>(
      '/api/auth/login',
      { email, password }
    ),
};

export const vehiclesApi = {
  getAll: () => api.get<Vehicle[]>('/api/vehicles'),

  search: (params: {
    make?: string;
    model?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => api.get<Vehicle[]>('/api/vehicles/search', { params }),

  getById: (id: string) => api.get<Vehicle>(`/api/vehicles/${id}`),

  create: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Vehicle>('/api/vehicles', data),

  update: (id: string, data: Partial<Vehicle>) =>
    api.put<Vehicle>(`/api/vehicles/${id}`, data),

  delete: (id: string) => api.delete(`/api/vehicles/${id}`),

  purchase: (id: string, quantity: number = 1) =>
    api.post<Vehicle>(`/api/vehicles/${id}/purchase`, { quantity }),

  restock: (id: string, quantity: number) =>
    api.post<Vehicle>(`/api/vehicles/${id}/restock`, { quantity }),
};
