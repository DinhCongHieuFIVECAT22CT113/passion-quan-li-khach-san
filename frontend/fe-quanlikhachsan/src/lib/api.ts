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
export const getAuthHeaders = (method = 'GET') => {
  const token = getToken();
  
  // Với các phương thức GET và OPTIONS, không cần gửi Content-Type
  if (method === 'GET' || method === 'OPTIONS') {
    return {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }
  
  // Các phương thức khác như POST, PUT, DELETE có thể cần Content-Type
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function để tạo headers cho form data
export const getFormDataHeaders = () => {
  const token = getToken();
  return {
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function để xử lý response
export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      // Thử parse lỗi JSON từ server
      const errorData = await response.json();
      const errorMessage = errorData.message || response.statusText;
      console.error('API error:', errorData);
      
      if (response.status === 401) {
        // Xóa thông tin đăng nhập nếu server báo unauthorized
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
        }
        throw new Error('Không có quyền truy cập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      throw new Error(errorMessage);
    } catch (e) {
      console.error('Response error:', response.status, response.statusText);
      if (response.status === 0) {
        throw new Error(`Không thể kết nối đến server backend tại ${API_BASE_URL}. Vui lòng kiểm tra server đã chạy chưa và CORS đã được cấu hình đúng.`);
      } else if (response.status === 404) {
        throw new Error(`API endpoint không tồn tại (404): ${response.url}`);
      } else if (response.status === 401) {
        // Xóa thông tin đăng nhập nếu server báo unauthorized
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
        }
        throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
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
  
  try {
  const response = await fetch(`${API_BASE_URL}/Auth/Đăng nhập`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
      headers: {
        // Không thêm Content-Type vì đang sử dụng FormData
        'Accept': 'application/json',
      }
  });

  return handleResponse(response);
  } catch (error) {
    console.error('Lỗi kết nối API:', error);
    throw new Error('Không thể kết nối đến API. Vui lòng kiểm tra server backend và kết nối mạng.');
  }
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
    headers: getAuthHeaders('GET'),
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
    headers: getAuthHeaders('GET'),
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
    headers: getAuthHeaders('GET'),
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
    headers: getAuthHeaders('GET'),
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
    headers: getAuthHeaders('GET'),
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
    headers: getAuthHeaders('GET'),
  });

  return handleResponse(response);
};

// Helper function để tạo request với token và xử lý refresh token khi cần
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // Kiểm tra token
  const token = getToken();
  
  // Thiết lập headers
  const headers = {
    ...options.headers,
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  try {
    // Thực hiện request
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'include',
    });
    
    // Xử lý lỗi 401 (token hết hạn)
    if (response.status === 401) {
      // Xóa thông tin người dùng hiện tại
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
      }
      
      // Nếu ở môi trường client, chuyển hướng người dùng đến trang đăng nhập
      if (typeof window !== 'undefined') {
        console.log('Phiên đăng nhập hết hạn, chuyển hướng đến trang đăng nhập');
        window.location.href = '/login';
      }
      
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    return response;
  } catch (error) {
    console.error('Error in fetchWithAuth:', error);
    throw error;
  }
};

// Hàm để làm mới token (có thể triển khai khi cần)
const refreshToken = async () => {
  // Triển khai hàm refresh token khi API hỗ trợ
  console.log('refreshToken not implemented yet');
  return null;
};

// API Lấy danh sách hóa đơn - endpoint từ Swagger
export const getInvoices = async () => {
  console.log(`Đang gọi API lấy danh sách hóa đơn: ${API_BASE_URL}/HoaDon/Lấy danh sách tất cả hóa đơn`);
  
  const response = await fetch(`${API_BASE_URL}/HoaDon/Lấy danh sách tất cả hóa đơn`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });

  return handleResponse(response);
};

// API Lấy chi tiết hóa đơn theo ID - endpoint từ Swagger
export const getInvoiceById = async (maHoaDon: string) => {
  console.log(`Đang gọi API lấy chi tiết hóa đơn: ${API_BASE_URL}/HoaDon/Tìm hóa đơn theo ID?maHoaDon=${maHoaDon}`);
  
  const response = await fetch(`${API_BASE_URL}/HoaDon/Tìm hóa đơn theo ID?maHoaDon=${maHoaDon}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });

  return handleResponse(response);
};

// API Tạo hóa đơn mới - endpoint từ Swagger
export const createInvoice = async (invoiceData: any) => {
  console.log(`Đang gọi API tạo hóa đơn mới: ${API_BASE_URL}/HoaDon/Tạo hóa đơn mới`);
  
  const formData = new FormData();
  for (const key in invoiceData) {
    if (invoiceData[key] !== undefined && invoiceData[key] !== null) {
      formData.append(key, String(invoiceData[key]));
    }
  }
  
  const response = await fetch(`${API_BASE_URL}/HoaDon/Tạo hóa đơn mới`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API Cập nhật hóa đơn - endpoint từ Swagger
export const updateInvoice = async (maHoaDon: string, invoiceData: any) => {
  console.log(`Đang gọi API cập nhật hóa đơn: ${API_BASE_URL}/HoaDon/Cập nhật hóa đơn?maHoaDon=${maHoaDon}`);
  
  const formData = new FormData();
  for (const key in invoiceData) {
    if (invoiceData[key] !== undefined && invoiceData[key] !== null) {
      formData.append(key, String(invoiceData[key]));
    }
  }
  
  const response = await fetch(`${API_BASE_URL}/HoaDon/Cập nhật hóa đơn?maHoaDon=${maHoaDon}`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API Xóa hóa đơn - endpoint từ Swagger
export const deleteInvoice = async (maHoaDon: string) => {
  console.log(`Đang gọi API xóa hóa đơn: ${API_BASE_URL}/HoaDon/Xóa hóa đơn?maHoaDon=${maHoaDon}`);
  
  const response = await fetch(`${API_BASE_URL}/HoaDon/Xóa hóa đơn?maHoaDon=${maHoaDon}`, {
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('DELETE'),
  });

  return handleResponse(response);
};

// API Tính tổng doanh thu theo tháng và năm - endpoint từ Swagger
export const calculateRevenue = async (thang: number, nam: number) => {
  console.log(`Đang gọi API tính tổng doanh thu: ${API_BASE_URL}/HoaDon/Tính tổng doanh thu?thang=${thang}&nam=${nam}`);
  
  const response = await fetch(`${API_BASE_URL}/HoaDon/Tính tổng doanh thu?thang=${thang}&nam=${nam}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });

  return handleResponse(response);
};

// API để lấy danh sách nhân viên
export const getStaffs = async () => {
  console.log(`Đang gọi API lấy danh sách nhân viên: ${API_BASE_URL}/NhanVien/Lấy danh sách tất cả nhân viên`);
  
  const response = await fetch(`${API_BASE_URL}/NhanVien/Lấy danh sách tất cả nhân viên`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });

  return handleResponse(response);
};

// API để tạo nhân viên mới
export const createStaff = async (staffData: any) => {
  console.log(`Đang gọi API tạo nhân viên mới: ${API_BASE_URL}/NhanVien/Tạo nhân viên mới`);
  
  const formData = new FormData();
  for (const key in staffData) {
    if (staffData[key] !== undefined && staffData[key] !== null) {
      formData.append(key, String(staffData[key]));
    }
  }
  
  const response = await fetch(`${API_BASE_URL}/NhanVien/Tạo nhân viên mới`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API để cập nhật nhân viên
export const updateStaff = async (staffData: any) => {
  console.log(`Đang gọi API cập nhật nhân viên: ${API_BASE_URL}/NhanVien/Cập nhật nhân viên`);
  
  const formData = new FormData();
  for (const key in staffData) {
    if (staffData[key] !== undefined && staffData[key] !== null) {
      formData.append(key, String(staffData[key]));
    }
  }
  
  const response = await fetch(`${API_BASE_URL}/NhanVien/Cập nhật nhân viên`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API để xóa nhân viên
export const deleteStaff = async (maNV: string) => {
  console.log(`Đang gọi API xóa nhân viên: ${API_BASE_URL}/NhanVien/Xóa nhân viên?id=${maNV}`);
  
  const response = await fetch(`${API_BASE_URL}/NhanVien/Xóa nhân viên?id=${maNV}`, {
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('DELETE'),
  });

  return handleResponse(response);
};

// API để lấy danh sách đánh giá
export const getReviews = async () => {
  console.log(`Đang gọi API lấy danh sách đánh giá: ${API_BASE_URL}/DanhGia/Lấy danh sách tất cả đánh giá`);
  
  const response = await fetch(`${API_BASE_URL}/DanhGia/Lấy danh sách tất cả đánh giá`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });

  return handleResponse(response);
};

// API để duyệt đánh giá
export const approveReview = async (maDG: string, isApproved: boolean) => {
  console.log(`Đang gọi API duyệt đánh giá: ${API_BASE_URL}/DanhGia/Duyệt đánh giá`);
  
  const formData = new FormData();
  formData.append('maDG', maDG);
  formData.append('trangThai', isApproved ? 'Đã duyệt' : 'Chưa duyệt');
  
  const response = await fetch(`${API_BASE_URL}/DanhGia/Duyệt đánh giá`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
}; 