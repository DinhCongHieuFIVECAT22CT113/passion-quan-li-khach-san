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

// Helper function để tạo headers cho form data
const getFormDataHeaders = () => {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function để xử lý response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    } catch (e) {
      throw new Error(`Lỗi kết nối đến server: ${response.status} ${response.statusText}`);
    }
  }
  
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Lỗi phân tích JSON từ response:', e);
    throw new Error('Lỗi khi xử lý dữ liệu từ server');
  }
};

// API Đăng nhập
export const loginUser = async (loginData: UserLoginDto): Promise<UserDto> => {
  const formData = new FormData();
  formData.append('UserName', loginData.userName);
  formData.append('Password', loginData.password);

  console.log(`Đang gọi API đăng nhập: ${API_BASE_URL}/Auth/Đăng nhập`, loginData.userName);
  
  const response = await fetch(`${API_BASE_URL}/Auth/Đăng nhập`, {
    method: 'POST',
    mode: 'cors',
    body: formData,
    headers: getFormDataHeaders(),
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

  console.log(`Đang gọi API đăng ký: ${API_BASE_URL}/Auth/Đăng ký`);
  
  const response = await fetch(`${API_BASE_URL}/Auth/Đăng ký`, {
    method: 'POST',
    mode: 'cors',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API Lấy danh sách phòng
export const getRooms = async () => {
  console.log(`Đang gọi API lấy danh sách phòng: ${API_BASE_URL}/Phong`);
  
  const response = await fetch(`${API_BASE_URL}/Phong`, {
    method: 'GET',
    mode: 'cors',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Lấy danh sách loại phòng
export const getRoomTypes = async () => {
  console.log(`Đang gọi API lấy danh sách loại phòng: ${API_BASE_URL}/LoaiPhong`);
  
  const response = await fetch(`${API_BASE_URL}/LoaiPhong`, {
    method: 'GET',
    mode: 'cors',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Đặt phòng
export const bookRoom = async (bookingData: any) => {
  console.log(`Đang gọi API đặt phòng: ${API_BASE_URL}/DatPhong`);
  
  const response = await fetch(`${API_BASE_URL}/DatPhong`, {
    method: 'POST',
    mode: 'cors',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });

  return handleResponse(response);
};

// API Lấy thông tin khách hàng
export const getCustomerProfile = async () => {
  console.log(`Đang gọi API lấy thông tin khách hàng: ${API_BASE_URL}/KhachHang/profile`);
  
  const response = await fetch(`${API_BASE_URL}/KhachHang/profile`, {
    method: 'GET',
    mode: 'cors',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Cập nhật thông tin khách hàng
export const updateCustomerProfile = async (profileData: any) => {
  console.log(`Đang gọi API cập nhật thông tin khách hàng: ${API_BASE_URL}/KhachHang/profile`);
  
  const response = await fetch(`${API_BASE_URL}/KhachHang/profile`, {
    method: 'PUT',
    mode: 'cors',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  return handleResponse(response);
};

// API Lấy lịch sử đặt phòng
export const getBookingHistory = async () => {
  console.log(`Đang gọi API lấy lịch sử đặt phòng: ${API_BASE_URL}/DatPhong/history`);
  
  const response = await fetch(`${API_BASE_URL}/DatPhong/history`, {
    method: 'GET',
    mode: 'cors',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Hủy đặt phòng
export const cancelBooking = async (bookingId: string) => {
  console.log(`Đang gọi API hủy đặt phòng: ${API_BASE_URL}/DatPhong/${bookingId}/cancel`);
  
  const response = await fetch(`${API_BASE_URL}/DatPhong/${bookingId}/cancel`, {
    method: 'PUT',
    mode: 'cors',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Lấy dịch vụ
export const getServices = async () => {
  console.log(`Đang gọi API lấy dịch vụ: ${API_BASE_URL}/DichVu`);
  
  const response = await fetch(`${API_BASE_URL}/DichVu`, {
    method: 'GET',
    mode: 'cors',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Lấy khuyến mãi
export const getPromotions = async () => {
  console.log(`Đang gọi API lấy khuyến mãi: ${API_BASE_URL}/KhuyenMai`);
  
  const response = await fetch(`${API_BASE_URL}/KhuyenMai`, {
    method: 'GET',
    mode: 'cors',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}; 