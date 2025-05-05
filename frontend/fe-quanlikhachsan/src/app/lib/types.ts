export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  description: string;
  amenities: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  guests: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  room?: Room;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingFilters {
  status?: Booking['status'];
  startDate?: string;
  endDate?: string;
  userId?: string;
  roomId?: string;
}

export interface RoomFilters {
  type?: Room['type'];
  status?: Room['status'];
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
} 