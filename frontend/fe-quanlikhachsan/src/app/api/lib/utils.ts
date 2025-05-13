export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const formatDateShort = (date: string | Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
};

export const calculateNights = (checkIn: string | Date, checkOut: string | Date): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    available: '#4CAF50',
    occupied: '#F44336',
    maintenance: '#FFC107',
    pending: '#2196F3',
    confirmed: '#4CAF50',
    cancelled: '#F44336',
    completed: '#9E9E9E'
  };
  return statusColors[status] || '#9E9E9E';
};

export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    available: 'Còn trống',
    occupied: 'Đã đặt',
    maintenance: 'Bảo trì',
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành'
  };
  return statusTexts[status] || status;
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validatePhone = (phone: string): boolean => {
  const re = /^(\+84|0)[0-9]{9,10}$/;
  return re.test(phone);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export const generateRoomNumber = (floor: number, number: number): string => {
  return `${floor.toString().padStart(2, '0')}${number.toString().padStart(2, '0')}`;
}; 