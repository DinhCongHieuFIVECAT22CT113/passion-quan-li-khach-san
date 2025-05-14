import { UserLoginDto, UserRegisterDto, UserDto } from '../types/auth';
import { API_BASE_URL } from './config';

// Helper function để lấy token từ localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function để tạo headers với token
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function để xử lý response
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = data.message || response.statusText;
    throw new Error(error);
  }
  
  return data;
};

// API Đăng nhập
export const loginUser = async (loginData: UserLoginDto): Promise<UserDto> => {
  const formData = new FormData();
  formData.append('UserName', loginData.userName);
  formData.append('Password', loginData.password);

  const response = await fetch(`${API_BASE_URL}/Auth/Đăng nhập`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
};

// API Đăng ký
export const registerUser = async (registerData: UserRegisterDto): Promise<UserDto> => {
  const formData = new FormData();
  formData.append('UserName', registerData.userName);
  formData.append('Password', registerData.password);
  formData.append('ConfirmPassword', registerData.confirmPassword);
  formData.append('HoKh', registerData.hoKh);
  formData.append('TenKh', registerData.tenKh);
  formData.append('Email', registerData.email);
  formData.append('SoCccd', registerData.soCccd);
  formData.append('SoDienThoai', registerData.soDienThoai);

  const response = await fetch(`${API_BASE_URL}/Auth/Đăng ký`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
};

// API Lấy danh sách phòng
export const getRooms = async () => {
  const response = await fetch(`${API_BASE_URL}/Phong`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Lấy danh sách loại phòng
export const getRoomTypes = async () => {
  const response = await fetch(`${API_BASE_URL}/LoaiPhong`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Đặt phòng
export const bookRoom = async (bookingData: any) => {
  const response = await fetch(`${API_BASE_URL}/DatPhong`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });

  return handleResponse(response);
};

// API Lấy thông tin khách hàng
export const getCustomerProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/KhachHang/profile`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Cập nhật thông tin khách hàng
export const updateCustomerProfile = async (profileData: any) => {
  const response = await fetch(`${API_BASE_URL}/KhachHang/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  return handleResponse(response);
};

// API Lấy lịch sử đặt phòng
export const getBookingHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/DatPhong/history`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Hủy đặt phòng
export const cancelBooking = async (bookingId: string) => {
  const response = await fetch(`${API_BASE_URL}/DatPhong/${bookingId}/cancel`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Lấy dịch vụ
export const getServices = async () => {
  const response = await fetch(`${API_BASE_URL}/DichVu`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Lấy khuyến mãi
export const getPromotions = async () => {
  const response = await fetch(`${API_BASE_URL}/KhuyenMai`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}; 