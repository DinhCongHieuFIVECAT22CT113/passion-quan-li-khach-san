const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return { error: 'Unauthorized' };
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API call failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetchWithAuth<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: { email: string; password: string; name: string }) =>
      fetchWithAuth<{ token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
  },
  users: {
    getProfile: () => fetchWithAuth<any>('/users/profile'),
    updateProfile: (data: any) =>
      fetchWithAuth('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  rooms: {
    getAll: () => fetchWithAuth<any[]>('/rooms'),
    getById: (id: string) => fetchWithAuth<any>(`/rooms/${id}`),
    create: (data: any) =>
      fetchWithAuth('/rooms', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchWithAuth(`/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchWithAuth(`/rooms/${id}`, {
        method: 'DELETE',
      }),
    search: (params: { checkIn: string; checkOut: string; guests: number }) =>
      fetchWithAuth('/rooms/search', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
  },
  bookings: {
    getAll: () => fetchWithAuth<any[]>('/bookings'),
    getById: (id: string) => fetchWithAuth<any>(`/bookings/${id}`),
    create: (data: any) =>
      fetchWithAuth('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchWithAuth(`/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchWithAuth(`/bookings/${id}`, {
        method: 'DELETE',
      }),
  },
}; 