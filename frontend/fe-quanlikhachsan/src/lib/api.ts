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
      const errorMessage = errorData.message || response.statusText;
      console.error('API error:', errorData);
      throw new Error(errorMessage);
    } catch (e) {
      console.error('Response error:', response.status, response.statusText);
      if (response.status === 0) {
        throw new Error(`Không thể kết nối đến server backend tại ${API_BASE_URL}. Vui lòng kiểm tra server đã chạy chưa và CORS đã được cấu hình đúng.`);
      } else if (response.status === 404) {
        throw new Error(`API endpoint không tồn tại (404): ${response.url}`);
      } else if (response.status === 401) {
        throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
      } else if (response.status === 403) {
        throw new Error('Bạn không có quyền thực hiện hành động này.');
      } else {
        throw new Error(`Lỗi kết nối đến server: ${response.status} ${response.statusText}`);
      }
    }
  }
  
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Lỗi phân tích JSON từ response:', e);
    // Nếu response.ok nhưng không có JSON, có thể là response rỗng hoặc không phải JSON
    if (response.status === 204) { // No Content
      return null;
    }
    throw new Error('Lỗi khi xử lý dữ liệu từ server');
  }
};

// API Đăng nhập - chính xác từ Swagger
export const loginUser = async (loginData: UserLoginDto): Promise<UserDto> => {
  const formData = new FormData();
  formData.append('UserName', loginData.userName);
  formData.append('Password', loginData.password);

  console.log(`Đang gọi API đăng nhập: ${API_BASE_URL}/Auth/Đăng nhập`, loginData.userName);
  
  const response = await fetch(`${API_BASE_URL}/Auth/Đăng nhập`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
  });

  return handleResponse(response);
};

// API Đăng ký - chính xác từ Swagger
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
    credentials: 'include',
    body: formData,
  });

  return handleResponse(response);
};

// API Lấy danh sách phòng - endpoint từ Swagger
export const getRooms = async () => {
  console.log(`Đang gọi API lấy danh sách phòng: ${API_BASE_URL}/Phong/Lấy danh sách tất cả phòng`);
  
  const response = await fetch(`${API_BASE_URL}/Phong/Lấy danh sách tất cả phòng`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Lấy danh sách loại phòng - endpoint từ Swagger
export const getRoomTypes = async () => {
  console.log(`Đang gọi API lấy danh sách loại phòng: ${API_BASE_URL}/LoaiPhong/Lấy danh sách tất cả loại phòng`);
  
  const response = await fetch(`${API_BASE_URL}/LoaiPhong/Lấy danh sách tất cả loại phòng`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Đặt phòng - endpoint từ Swagger
export const bookRoom = async (bookingData: any) => {
  const formData = new FormData();
  
  for (const key in bookingData) {
    formData.append(key, bookingData[key]);
  }
  
  console.log(`Đang gọi API đặt phòng: ${API_BASE_URL}/DatPhong/Tạo đặt phòng mới`);
  
  const response = await fetch(`${API_BASE_URL}/DatPhong/Tạo đặt phòng mới`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API Lấy thông tin khách hàng - endpoint từ Swagger
export const getCustomerProfile = async (maKh: string) => {
  console.log(`Đang gọi API lấy thông tin khách hàng: ${API_BASE_URL}/KhachHang/Tìm khách hàng theo ID?id=${maKh}`);
  
  const response = await fetch(`${API_BASE_URL}/KhachHang/Tìm khách hàng theo ID?id=${maKh}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Cập nhật thông tin khách hàng - endpoint từ Swagger
export const updateCustomerProfile = async (profileData: any) => {
  const formData = new FormData();
  
  for (const key in profileData) {
    formData.append(key, profileData[key]);
  }
  
  console.log(`Đang gọi API cập nhật thông tin khách hàng: ${API_BASE_URL}/KhachHang/Cập nhật khách hàng`);
  
  const response = await fetch(`${API_BASE_URL}/KhachHang/Cập nhật khách hàng`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API Lấy lịch sử đặt phòng - endpoint từ Swagger
export const getBookingHistory = async (maKh: string) => {
  console.log(`Đang gọi API lấy lịch sử đặt phòng: ${API_BASE_URL}/DatPhong/Lấy danh sách đặt phòng`);
  
  const response = await fetch(`${API_BASE_URL}/DatPhong/Lấy danh sách đặt phòng`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  // Lọc đặt phòng theo khách hàng (frontend filtering)
  const allBookings = await handleResponse(response);
  return allBookings.filter((booking: any) => booking.maKh === maKh);
};

// API Hủy đặt phòng - endpoint từ Swagger
export const cancelBooking = async (bookingId: string) => {
  console.log(`Đang gọi API hủy đặt phòng (cập nhật trạng thái): ${API_BASE_URL}/DatPhong/Cập nhật đặt phòng`);
  
  // Đầu tiên lấy thông tin đặt phòng
  const getResponse = await fetch(`${API_BASE_URL}/DatPhong/Tìm đặt phòng theo ID?id=${bookingId}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders(),
  });
  
  const bookingInfo = await handleResponse(getResponse);
  
  // Cập nhật trạng thái thành "Đã hủy"
  const formData = new FormData();
  for (const key in bookingInfo) {
    formData.append(key, bookingInfo[key]);
  }
  formData.set('TrangThai', "Đã hủy");
  
  const response = await fetch(`${API_BASE_URL}/DatPhong/Cập nhật đặt phòng`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API Lấy dịch vụ - endpoint từ Swagger
export const getServices = async () => {
  console.log(`Đang gọi API lấy dịch vụ: ${API_BASE_URL}/DichVu/Lấy danh sách tất cả dịch vụ`);
  
  const response = await fetch(`${API_BASE_URL}/DichVu/Lấy danh sách tất cả dịch vụ`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// API Lấy khuyến mãi - endpoint từ Swagger
export const getPromotions = async () => {
  console.log(`Đang gọi API lấy khuyến mãi: ${API_BASE_URL}/KhuyenMai/Lấy danh sách tất cả khuyến mãi`);
  
  const response = await fetch(`${API_BASE_URL}/KhuyenMai/Lấy danh sách tất cả khuyến mãi`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}; 