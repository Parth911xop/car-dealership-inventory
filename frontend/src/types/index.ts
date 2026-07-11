export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year: number;
  color?: string;
  mileage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
