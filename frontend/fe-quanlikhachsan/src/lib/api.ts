import { UserLoginDto, UserRegisterDto, UserDto } from '../types/auth';
import { API_BASE_URL } from './config';
import { PhongDTO, LoaiPhongDTO } from './DTOs';
import { ensureValidToken } from './tokenManager';

// Helper function để lấy token từ localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function để tạo headers với token (với auto-refresh)
export const getAuthHeaders = async (method = 'GET') => {
  const token = await ensureValidToken();

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

// Helper function để tạo headers cho form data (với auto-refresh)
export const getFormDataHeaders = async () => {
  const token = await ensureValidToken();
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
    } catch {
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

// Định nghĩa interfaces cho các đối tượng dữ liệu
interface BookingData {
  bookingId?: string;
  customerId?: string;
  roomId?: string;
  status?: string;
  bookingDate?: string;
  checkInDate?: string;
  checkOutDate?: string;
  nightCount?: number;
  guestCount?: number;
  notes?: string;
  totalAmount?: number;
  paymentMethod?: string;
  [key: string]: string | number | undefined;
}

interface InvoiceData {
  invoiceId?: string;
  bookingId?: string;
  customerId?: string;
  staffId?: string;
  createdDate?: string;
  totalAmount?: number;
  status?: string;
  notes?: string;
  paymentMethodId?: string;
  issueDate?: string;
  serviceDetails?: Array<{
    serviceId: string;
    quantity: number;
    price: number;
  }>;
  [key: string]: string | number | undefined | Array<{
    serviceId: string;
    quantity: number;
    price: number;
  }> | undefined;
}

interface RoomData {
  roomId?: string;
  roomNumber?: string | number;
  roomTypeId?: string;
  status?: string;
  createdDate?: string;
  floor?: string | number;
  thumbnail?: string;
  image?: string;
  price?: number;
  [key: string]: string | number | undefined;
}

// API Đăng nhập - chính xác từ Swagger
export const loginUser = async (loginData: UserLoginDto): Promise<UserDto> => {
  const formData = new FormData();
  formData.append('UserName', loginData.userName);
  formData.append('Password', loginData.password);

  console.log(`Đang gọi API đăng nhập: ${API_BASE_URL}/Auth/login`, loginData.userName);

  try {
  const response = await fetch(`${API_BASE_URL}/Auth/login`, {
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

// API Đăng ký
export const registerUser = async (registerData: UserRegisterDto): Promise<UserDto> => {
  const formData = new FormData();
  formData.append('UserName', registerData.userName);
  formData.append('Email', registerData.email);
  formData.append('Password', registerData.password);
  formData.append('ConfirmPassword', registerData.confirmPassword);
  formData.append('HoKh', registerData.hoKh);
  formData.append('TenKh', registerData.tenKh);
  formData.append('SoCccd', registerData.soCccd);
  formData.append('SoDienThoai', registerData.soDienThoai);

  try {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
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

// API Refresh Token
export const refreshToken = async (refreshTokenData: { refreshToken: string; userId: string; userType: string }): Promise<UserDto> => {
  const formData = new FormData();
  formData.append('RefreshToken', refreshTokenData.refreshToken);
  formData.append('UserId', refreshTokenData.userId);
  formData.append('UserType', refreshTokenData.userType);

  console.log(`Đang gọi API refresh token: ${API_BASE_URL}/Auth/refresh-token`);

  try {
    const response = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      body: formData,
      headers: {
        'Accept': 'application/json',
      }
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Lỗi kết nối API refresh token:', error);
    throw new Error('Không thể refresh token. Vui lòng đăng nhập lại.');
  }
};

// API lấy danh sách phòng
export const getRooms = async () => {
  console.log(`Đang gọi API lấy danh sách phòng: ${API_BASE_URL}/Phong`);

  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/Phong`, {
    method: 'GET',
    headers: headers,
      credentials: 'include'
  });

  const data = await handleResponse(response);
  if (Array.isArray(data)) {
    return data;
    } else {
      console.error('Dữ liệu rooms không phải mảng:', data);
      throw new Error('Định dạng dữ liệu không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi khi gọi API getRooms:', error);
    throw error;
  }
};

// API lấy danh sách loại phòng
export const getRoomTypes = async () => {
  console.log(`Đang gọi API lấy danh sách loại phòng: ${API_BASE_URL}/LoaiPhong`);

  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/LoaiPhong`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });

    const data = await handleResponse(response);
    if (Array.isArray(data)) {
      return data;
    } else {
    console.error('Dữ liệu roomTypes không phải mảng:', data);
      throw new Error('Định dạng dữ liệu không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi khi gọi API getRoomTypes:', error);
    throw error;
  }
};

// API tạo phòng mới
export const createRoom = async (roomData: RoomData) => {
  console.log(`Đang gọi API tạo phòng: ${API_BASE_URL}/Phong`);

  const formData = new FormData();
  // Thêm các trường dữ liệu vào formData
  for (const [key, value] of Object.entries(roomData)) {
    if (value !== undefined && value !== null) {
      if (key === 'thumbnail' && typeof value === 'object') {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  }

  try {
    const headers = await getFormDataHeaders();
    const response = await fetch(`${API_BASE_URL}/Phong`, {
    method: 'POST',
    headers: headers,
      body: formData,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi gọi API createRoom:', error);
    throw error;
  }
};

// API cập nhật phòng
export const updateRoom = async (roomId: string, roomData: unknown) => {
  console.log(`Đang gọi API cập nhật phòng: ${API_BASE_URL}/Phong/${roomId}`);

  const formData = new FormData();
  // Thêm các trường dữ liệu vào formData
  if (typeof roomData === 'object' && roomData !== null) {
    for (const [key, value] of Object.entries(roomData)) {
      if (value !== undefined && value !== null) {
        if (key === 'thumbnail' && typeof value === 'object') {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    }
  }

  try {
    const headers = await getFormDataHeaders();
    const response = await fetch(`${API_BASE_URL}/Phong/${roomId}`, {
    method: 'PUT',
    headers: headers,
      body: formData,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi gọi API updateRoom:', error);
    throw error;
  }
};

// API xóa phòng
export const deleteRoom = async (roomId: string) => {
  console.log(`Đang gọi API xóa phòng: ${API_BASE_URL}/Phong/${roomId}`);

  try {
    const headers = await getAuthHeaders('DELETE');
    const response = await fetch(`${API_BASE_URL}/Phong/${roomId}`, {
    method: 'DELETE',
      headers: headers,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi gọi API deleteRoom:', error);
    throw error;
  }
};

// API đặt phòng (sử dụng FormData theo yêu cầu backend)
export const createDatPhong = async (bookingData: {
  maKH: string;
  maPhong: string;
  treEm?: number;
  nguoiLon?: number;
  ghiChu?: string;
  soLuongPhong?: number;
  thoiGianDen?: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
}) => {
  console.log(`Đang gọi API đặt phòng: ${API_BASE_URL}/DatPhong`, bookingData);

  try {
    const formData = new FormData();
    formData.append('MaKH', bookingData.maKH);
    formData.append('MaPhong', bookingData.maPhong);
    formData.append('TreEm', (bookingData.treEm || 0).toString());
    formData.append('NguoiLon', (bookingData.nguoiLon || 1).toString());
    formData.append('GhiChu', bookingData.ghiChu || 'Đặt phòng qua website');
    formData.append('SoLuongPhong', (bookingData.soLuongPhong || 1).toString());
    formData.append('ThoiGianDen', bookingData.thoiGianDen || '14:00');
    formData.append('NgayNhanPhong', bookingData.ngayNhanPhong);
    formData.append('NgayTraPhong', bookingData.ngayTraPhong);

    const headers = await getFormDataHeaders();
    const response = await fetch(`${API_BASE_URL}/DatPhong`, {
      method: 'POST',
      headers: headers,
      body: formData,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi gọi API createDatPhong:', error);
    throw error;
  }
};

// API đặt phòng (legacy - sử dụng JSON)
export const bookRoom = async (bookingData: BookingData) => {
  console.log(`Đang gọi API đặt phòng: ${API_BASE_URL}/DatPhong`, bookingData);

  try {
    const headers = await getAuthHeaders('POST');
    const response = await fetch(`${API_BASE_URL}/DatPhong`, {
    method: 'POST',
      headers: headers,
      body: JSON.stringify(bookingData),
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi gọi API bookRoom:', error);
    throw error;
  }
};

// API lấy thông tin hồ sơ khách hàng
export const getCustomerProfile = async (customerId: string) => {
  console.log(`Đang gọi API lấy thông tin khách hàng: ${API_BASE_URL}/KhachHang/${customerId}`);
  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/KhachHang/${customerId}`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });
    const data = await handleResponse(response);
    // Trả về dữ liệu gốc từ KhachHangDTO, không map lại tên trường
    // Ví dụ: data sẽ có MaKh, HoKh, TenKh, Email, Sdt, SoCccd
    return data;
  } catch (error) {
    console.error('Lỗi khi gọi API getCustomerProfile:', error);
    throw error;
  }
};

// API cập nhật hồ sơ khách hàng
export const updateCustomerProfile = async (profileData: unknown) => {
  try {
  const formData = new FormData();

    if (typeof profileData === 'object' && profileData !== null) {
      for (const [key, value] of Object.entries(profileData)) {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
    }

    const headers = await getFormDataHeaders();
    const response = await fetch(`${API_BASE_URL}/KhachHang`, {
    method: 'PUT',
    headers: headers,
      body: formData,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ:', error);
    throw error;
  }
};

// API lấy lịch sử đặt phòng của người dùng hiện tại (từ token)
export const getBookingHistory = async () => {
  console.log(`Đang gọi API lấy lịch sử đặt phòng của người dùng hiện tại`);
  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/DatPhong/KhachHang`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });

    const data = await handleResponse(response);
    if (Array.isArray(data)) {
      return data;
    } else {
      console.error('Dữ liệu lịch sử đặt phòng không phải mảng:', data);
      throw new Error('Định dạng dữ liệu không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi khi gọi API getBookingHistory:', error);
    throw error;
  }
};

// API hủy đặt phòng
export const cancelBooking = async (bookingId: string) => {
  try {
    const headers = await getAuthHeaders('PUT');
    const response = await fetch(`${API_BASE_URL}/DatPhong/${bookingId}/cancel`, {
    method: 'PUT',
      headers: headers,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi hủy đặt phòng:', error);
    throw error;
  }
};

// API lấy danh sách dịch vụ
export const getServices = async () => {
  console.log(`Đang gọi API lấy danh sách dịch vụ: ${API_BASE_URL}/DichVu`);

  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/DichVu`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });

    const data = await handleResponse(response);
    if (Array.isArray(data)) {
      return data;
    } else {
      console.error('Dữ liệu dịch vụ không phải mảng:', data);
      throw new Error('Định dạng dữ liệu không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi khi gọi API getServices:', error);
    throw error;
  }
};

// API lấy danh sách khuyến mãi
export const getPromotions = async () => {
  console.log(`Đang gọi API lấy danh sách khuyến mãi: ${API_BASE_URL}/KhuyenMai`);

  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/KhuyenMai`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });

    const data = await handleResponse(response);
    if (Array.isArray(data)) {
      return data;
    } else {
      console.error('Dữ liệu khuyến mãi không phải mảng:', data);
      throw new Error('Định dạng dữ liệu không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi khi gọi API getPromotions:', error);
    throw error;
  }
};

// API lấy danh sách hóa đơn
export const getInvoices = async () => {
  console.log(`Đang gọi API lấy danh sách hóa đơn: ${API_BASE_URL}/HoaDon`);
  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/HoaDon`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });
    const data = await handleResponse(response);
    if (Array.isArray(data)) {
      // Trả về dữ liệu gốc từ HoaDonDTO, đảm bảo các trường số là number
      return data.map(invoice => ({
        ...invoice, // Giữ nguyên các trường gốc như MaHoaDon, MaDatPhong, MaKM, TenKhuyenMai, TrangThai
        GiamGiaLoaiKM: invoice.GiamGiaLoaiKM !== null && invoice.GiamGiaLoaiKM !== undefined ? parseFloat(invoice.GiamGiaLoaiKM) : undefined,
        GiamGiaLoaiKH: invoice.GiamGiaLoaiKH !== null && invoice.GiamGiaLoaiKH !== undefined ? parseFloat(invoice.GiamGiaLoaiKH) : undefined,
        TongTien: parseFloat(invoice.TongTien) || 0,
      }));
    } else {
      console.error('Dữ liệu invoices không phải mảng:', data);
      throw new Error('Định dạng dữ liệu không hợp lệ');
    }
  } catch (error) {
    console.error('Lỗi khi gọi API getInvoices:', error);
    throw error;
  }
};

// API lấy chi tiết hóa đơn
export const getInvoiceById = async (invoiceId: string) => {
  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/HoaDon/${invoiceId}`, {
      headers: headers,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Lỗi khi lấy hóa đơn #${invoiceId}:`, error);
    throw error;
  }
};

// API tạo hóa đơn mới
export const createInvoice = async (invoiceData: InvoiceData) => {
  try {
    const headers = await getAuthHeaders('POST');
    const response = await fetch(`${API_BASE_URL}/HoaDon`, {
    method: 'POST',
      headers: headers,
      body: JSON.stringify(invoiceData),
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi tạo hóa đơn mới:', error);
    throw error;
  }
};

// API cập nhật hóa đơn (CHỈ CẬP NHẬT TRẠNG THÁI)
export const updateInvoiceStatus = async (invoiceId: string, status: string) => {
  console.log(`Đang gọi API cập nhật trạng thái hóa đơn: ${API_BASE_URL}/HoaDon/${invoiceId}/trangthai`);
  try {
    const authHeaders = await getAuthHeaders('PUT');
    const response = await fetch(`${API_BASE_URL}/HoaDon/${invoiceId}/trangthai`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ TrangThai: status })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await handleResponse(response);
    return { success: true, message: 'Cập nhật trạng thái thành công', data: result };
  } catch (error) {
    console.error('Lỗi khi gọi API updateInvoiceStatus:', error);
    throw error;
  }
};

// API xóa hóa đơn
export const deleteInvoice = async (invoiceId: string) => {
  try {
    const headers = await getAuthHeaders('DELETE');
    const response = await fetch(`${API_BASE_URL}/HoaDon/${invoiceId}`, {
    method: 'DELETE',
    headers: headers,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Lỗi khi xóa hóa đơn #${invoiceId}:`, error);
    throw error;
  }
};

// API tính doanh thu theo tháng
export const calculateRevenue = async (month: number, year: number) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/HoaDon/doanhthu?thang=${month}&nam=${year}`, {
      headers: headers,
      credentials: 'include'
    });

    const result = await handleResponse(response);
    console.log(`API calculateRevenue response for ${month}/${year}:`, result);

    // Backend trả về object { Thang, Nam, TongDoanhThu }
    return result.TongDoanhThu || result.tongDoanhThu || 0;
  } catch (error) {
    console.error(`Lỗi khi tính doanh thu tháng ${month}/${year}:`, error);
    throw error;
  }
};

// API lấy danh sách nhân viên
export const getStaffs = async () => {
  try {
    console.log(`Đang gọi API lấy danh sách nhân viên: ${API_BASE_URL}/NhanVien`);

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/NhanVien`, {
      headers: headers,
      credentials: 'include'
    });

    const data = await handleResponse(response);
    console.log('Raw staff data from API:', data);

    // Map dữ liệu staff đúng format
    if (Array.isArray(data)) {
      return data.map((apiStaff: any) => {
        console.log('Processing staff:', apiStaff);

        // Normalize field names (handle both PascalCase and camelCase)
        return {
          maNV: apiStaff.MaNv || apiStaff.maNV || apiStaff.MaNV || apiStaff.maNv || '',
          hoTen: `${apiStaff.HoNv || apiStaff.hoNv || ''} ${apiStaff.TenNv || apiStaff.tenNv || ''}`.trim(),
          hoNv: apiStaff.HoNv || apiStaff.hoNv || '',
          tenNv: apiStaff.TenNv || apiStaff.tenNv || '',
          userName: apiStaff.UserName || apiStaff.userName || '',
          chucVu: apiStaff.ChucVu || apiStaff.chucVu || 'Nhân viên',
          soDienThoai: apiStaff.Sdt || apiStaff.sdt || apiStaff.soDienThoai || apiStaff.SoDienThoai || '',
          email: apiStaff.Email || apiStaff.email || '',
          ngayVaoLam: apiStaff.NgayVaoLam || apiStaff.ngayVaoLam || '',
          luongCoBan: apiStaff.LuongCoBan || apiStaff.luongCoBan || 0,
          maRole: apiStaff.MaRole || apiStaff.maRole || '',
          trangThai: apiStaff.TrangThai || apiStaff.trangThai || 'Hoạt động',
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error);
    throw error;
  }
};

// API tạo nhân viên mới
export const createStaff = async (staffData: unknown) => {
  try {
  const formData = new FormData();

    if (typeof staffData === 'object' && staffData !== null) {
      for (const [key, value] of Object.entries(staffData)) {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
    }

    const headers = await getFormDataHeaders();
    const response = await fetch(`${API_BASE_URL}/NhanVien`, {
    method: 'POST',
    headers: headers,
      body: formData,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi tạo nhân viên mới:', error);
    throw error;
  }
};

// API cập nhật nhân viên
export const updateStaff = async (staffData: unknown) => {
  try {
  const formData = new FormData();
    let staffId = '';

    if (typeof staffData === 'object' && staffData !== null) {
      for (const [key, value] of Object.entries(staffData)) {
        if (key === 'maNv') staffId = String(value);
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
    }

    const headers = await getFormDataHeaders();
    const response = await fetch(`${API_BASE_URL}/NhanVien/${staffId}`, {
    method: 'PUT',
    headers: headers,
      body: formData,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi cập nhật nhân viên:', error);
    throw error;
  }
};

// API xóa nhân viên
export const deleteStaff = async (staffId: string) => {
  try {
    const headers = await getAuthHeaders('DELETE');
    const response = await fetch(`${API_BASE_URL}/NhanVien/${staffId}`, {
    method: 'DELETE',
    headers: headers,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Lỗi khi xóa nhân viên #${staffId}:`, error);
    throw error;
  }
};

// API lấy danh sách đánh giá
export const getReviews = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/Review`, {
      headers: headers,
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đánh giá:', error);
    throw error;
  }
};

// API phê duyệt/từ chối đánh giá
export const approveReview = async (reviewId: string, isApproved: boolean) => {
  try {
    const headers = await getAuthHeaders('PUT');
    const response = await fetch(`${API_BASE_URL}/Review/${reviewId}/approve`, {
    method: 'PUT',
      headers: headers,
      body: JSON.stringify({ isApproved }),
      credentials: 'include'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Lỗi khi ${isApproved ? 'phê duyệt' : 'từ chối'} đánh giá #${reviewId}:`, error);
    throw error;
  }
};

// API để lấy và cập nhật trạng thái phòng cho nhân viên
export const getEmployeeRooms = async () => {
  console.log(`Đang gọi API lấy danh sách phòng cho nhân viên: ${API_BASE_URL}/Phong`);

  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/Phong`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: headers,
    });

    const data = await handleResponse(response);
    console.log('Dữ liệu phòng từ API:', data);

    // Chuyển đổi từ định dạng backend sang định dạng frontend
    if (Array.isArray(data)) {
      return data.map(room => {
        console.log('Processing room:', room);

        return {
          id: room.maPhong || room.roomId,
          name: room.soPhong || room.roomNumber,
          type: room.maLoaiPhong || room.roomTypeId,
          price: 0, // Sẽ lấy từ room type
          status: room.trangThai || room.status || 'Trống',
          tang: room.tang || room.floor || 1
        };
      });
    }

    return [];
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phòng cho nhân viên:', err);
    return [];
  }
};

// API cập nhật trạng thái phòng cho nhân viên
export const updateRoomStatus = async (roomId: string, status: string) => {
  console.log(`Đang gọi API cập nhật trạng thái phòng: ${API_BASE_URL}/Phong/${roomId}`);

  const formData = new FormData();
  formData.append('roomId', roomId);
  formData.append('status', status);

  const headers = await getFormDataHeaders();
  const response = await fetch(`${API_BASE_URL}/Phong/${roomId}`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: headers,
  });

  return handleResponse(response);
};

// API lấy danh sách đặt phòng cho nhân viên
export const getEmployeeBookings = async () => {
  console.log(`Đang gọi API lấy danh sách đặt phòng cho nhân viên: ${API_BASE_URL}/DatPhong`);

  const headers = await getAuthHeaders('GET');
  const response = await fetch(`${API_BASE_URL}/DatPhong`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: headers,
  });

  const bookingsData = await handleResponse(response);

  // Lấy thêm thông tin khách hàng
  const customersHeaders = await getAuthHeaders('GET');
  const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: customersHeaders,
  });

  const customersData = await handleResponse(customersResponse);
  const customers = Array.isArray(customersData) ? customersData : [];

  // Lấy thêm thông tin phòng
  const roomsHeaders = await getAuthHeaders('GET');
  const roomsResponse = await fetch(`${API_BASE_URL}/Phong`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: roomsHeaders,
  });

  const roomsData = await handleResponse(roomsResponse);
  const rooms = Array.isArray(roomsData) ? roomsData : [];

  // Chuyển đổi từ định dạng backend sang định dạng frontend
  if (Array.isArray(bookingsData)) {
    return bookingsData.map(booking => {
      console.log('Processing booking:', booking);

      // Tìm khách hàng theo mã KH
      const customer = customers.find(c =>
        (c.maKh || c.MaKh) === (booking.maKH || booking.MaKH)
      ) || {};

      // Tìm phòng theo mã phòng
      const room = rooms.find(r =>
        (r.maPhong || r.MaPhong) === (booking.maPhong || booking.MaPhong)
      ) || {};

      return {
        id: booking.maDatPhong || booking.MaDatPhong || `booking-${Math.random()}`,
        customerId: booking.maKH || booking.MaKH || '',
        customerName: customer ? `${customer.hoKh || customer.HoKh || ''} ${customer.tenKh || customer.TenKh || ''}`.trim() : 'Không xác định',
        roomId: booking.maPhong || booking.MaPhong || '',
        roomName: room ? (room.soPhong || room.SoPhong || 'N/A') : 'Không xác định',
        checkInDate: booking.ngayNhanPhong || booking.NgayNhanPhong || '',
        checkOutDate: booking.ngayTraPhong || booking.NgayTraPhong || '',
        status: booking.trangThai || booking.TrangThai || 'Đã đặt',
        note: booking.ghiChu || booking.GhiChu || '',
        totalPrice: booking.tongTien || booking.TongTien || 0,
        phoneNumber: customer?.sdt || customer?.Sdt || '',
        email: customer?.email || customer?.Email || ''
      };
    });
  }

  return [];
};

// API cập nhật trạng thái đặt phòng cho nhân viên
export const updateBookingStatus = async (bookingId: string, status: string) => {
  console.log(`Đang gọi API cập nhật trạng thái đặt phòng: ${API_BASE_URL}/DatPhong/${bookingId}`);

  // Đầu tiên lấy thông tin đặt phòng hiện tại
  const getHeaders = await getAuthHeaders('GET');
  const getResponse = await fetch(`${API_BASE_URL}/DatPhong/${bookingId}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getHeaders,
  });

  const bookingData = await handleResponse(getResponse);

  if (!bookingData) {
    throw new Error('Không tìm thấy thông tin đặt phòng');
  }

  // Cập nhật trạng thái
  const formData = new FormData();

  // Sử dụng forEach để thêm tất cả thuộc tính từ bookingData vào formData
  Object.entries(bookingData as Record<string, any>).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  // Ghi đè trạng thái mới
  formData.set('status', status);

  const headers = await getFormDataHeaders();
  const response = await fetch(`${API_BASE_URL}/DatPhong/${bookingId}`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: headers,
  });

  return handleResponse(response);
};

// API tạo đặt phòng mới cho nhân viên
export const createEmployeeBooking = async (bookingData: BookingData) => {
  console.log(`Đang gọi API tạo đặt phòng mới: ${API_BASE_URL}/DatPhong`, bookingData);

  const formData = new FormData();

  // Chuyển đổi key từ camelCase sang PascalCase cho phù hợp với API
  const keyMapping: Record<string, string> = {
    customerId: 'CustomerId',
    roomId: 'RoomId',
    checkInDate: 'CheckInDate',
    checkOutDate: 'CheckOutDate',
    status: 'Status',
    notes: 'Notes',
  };

  for (const key in bookingData) {
    const backendKey = keyMapping[key] || key;
    formData.append(backendKey, String(bookingData[key] || ''));
  }

  const headers = await getFormDataHeaders();
  const response = await fetch(`${API_BASE_URL}/DatPhong`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: headers,
  });

  return handleResponse(response);
};

// API lấy danh sách hóa đơn cho nhân viên
export const getEmployeeInvoices = async () => {
  console.log(`Đang gọi API lấy danh sách hóa đơn cho nhân viên: ${API_BASE_URL}/HoaDon`);

  const headers = await getAuthHeaders('GET');
  const response = await fetch(`${API_BASE_URL}/HoaDon`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: headers,
  });

  const invoicesData = await handleResponse(response);

  // Lấy thông tin đặt phòng
  const bookingsHeaders = await getAuthHeaders('GET');
  const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: bookingsHeaders,
  });

  const bookingsData = await handleResponse(bookingsResponse);
  const bookings = Array.isArray(bookingsData) ? bookingsData : [];

  // Lấy thông tin khách hàng
  const customersHeaders2 = await getAuthHeaders('GET');
  const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: customersHeaders2,
  });

  const customersData = await handleResponse(customersResponse);
  const customers = Array.isArray(customersData) ? customersData : [];

  // Chuyển đổi từ định dạng backend sang định dạng frontend
  if (Array.isArray(invoicesData)) {
    return invoicesData.map((invoice, index) => {
      console.log('Processing invoice:', invoice);

      // Tìm booking theo mã đặt phòng
      const booking = bookings.find(b =>
        (b.maDatPhong || b.MaDatPhong) === (invoice.maDatPhong || invoice.MaDatPhong)
      ) || {};

      // Tìm customer theo mã khách hàng
      const customer = customers.find(c =>
        (c.maKh || c.MaKh) === (booking.maKH || booking.MaKH)
      ) || {};

      return {
        id: invoice.maHoaDon || invoice.MaHoaDon || invoice.invoiceId || `HD${index + 1}`,
        bookingId: invoice.maDatPhong || invoice.MaDatPhong || booking.maDatPhong || '',
        customerId: booking.maKH || booking.MaKH || '',
        customerName: customer ? `${customer.hoKh || customer.HoKh || ''} ${customer.tenKh || customer.TenKh || ''}`.trim() : 'Không xác định',
        amount: parseFloat(invoice.tongTien || invoice.TongTien || invoice.totalAmount || 0),
        date: invoice.ngayLap || invoice.NgayLap || invoice.issueDate || new Date().toISOString(),
        paymentMethod: invoice.phuongThucThanhToan || invoice.PhuongThucThanhToan || invoice.paymentMethodId || 'Tiền mặt',
        status: invoice.trangThai || invoice.TrangThai || invoice.status || 'Chưa thanh toán',
        note: invoice.ghiChu || invoice.GhiChu || invoice.notes || ''
      };
    });
  }

  return [];
};

// API tạo hóa đơn mới cho nhân viên
export const createEmployeeInvoice = async (invoiceData: InvoiceData) => {
  console.log(`Đang gọi API tạo hóa đơn mới: ${API_BASE_URL}/HoaDon`, invoiceData);

  const formData = new FormData();

  // Chuyển đổi key từ camelCase sang PascalCase cho phù hợp với API
  const keyMapping: Record<string, string> = {
    bookingId: 'BookingId',
    totalAmount: 'TotalAmount',
    paymentMethodId: 'PaymentMethodId',
    status: 'Status',
    notes: 'Notes',
    issueDate: 'IssueDate'
  };

  for (const key in invoiceData) {
    const backendKey = keyMapping[key] || key;
    formData.append(backendKey, String(invoiceData[key] || ''));
  }

  // Nếu không có ngày lập, thêm ngày hiện tại
  if (!(invoiceData as Record<string, any>).issueDate) {
    formData.append('IssueDate', new Date().toISOString());
  }

  const headers = await getFormDataHeaders();
  const response = await fetch(`${API_BASE_URL}/HoaDon`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: headers,
  });

  return handleResponse(response);
};

// API lấy thống kê dashboard cho manager
export const getDashboardStats = async () => {
  try {
    // Lấy dữ liệu từ các API có sẵn để tính toán thống kê
    const [roomsData, bookingsData, invoicesData, staffsData] = await Promise.all([
      getEmployeeRooms().catch(() => []),
      getEmployeeBookings().catch(() => []),
      getInvoices().catch(() => []),
      getStaffs().catch(() => [])
    ]);

    // Tính toán thống kê phòng
    const roomStats = {
      total: roomsData.length,
      available: roomsData.filter(r => r.status === 'Trống').length,
      occupied: roomsData.filter(r => r.status === 'Đang ở').length,
      maintenance: roomsData.filter(r => r.status === 'Bảo trì').length
    };

    // Tính toán thống kê đặt phòng
    const today = new Date().toISOString().split('T')[0];
    const bookingStats = {
      today: bookingsData.filter(b => b.checkInDate?.includes(today)).length,
      pending: bookingsData.filter(b => b.status === 'Đã đặt').length,
      completed: bookingsData.filter(b => b.status === 'Đã trả phòng').length,
      cancelled: bookingsData.filter(b => b.status === 'Đã hủy').length
    };

    // Tính toán doanh thu
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = invoicesData
      .filter(inv => {
        const invDate = new Date(inv.NgayLap || inv.ngayLap || inv.date);
        return invDate.getMonth() + 1 === currentMonth && invDate.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + (parseFloat(inv.TongTien || inv.tongTien || inv.amount) || 0), 0);

    const revenueStats = {
      today: Math.floor(monthlyRevenue / 30), // Ước tính
      week: Math.floor(monthlyRevenue / 4), // Ước tính
      month: monthlyRevenue,
      average: Math.floor(monthlyRevenue / 30)
    };

    // Thống kê nhân viên
    const staffStats = {
      total: staffsData.length,
      onDuty: Math.floor(staffsData.length * 0.7), // Ước tính
      managers: staffsData.filter(s => s.chucVu?.includes('Quản lý')).length,
      employees: staffsData.filter(s => !s.chucVu?.includes('Quản lý')).length,
      accountants: staffsData.filter(s => s.chucVu?.includes('Kế toán')).length
    };

    // Đặt phòng gần đây
    const recentBookings = bookingsData
      .slice(0, 5)
      .map(booking => ({
        maDatPhong: booking.id,
        customerName: booking.customerName,
        maKh: booking.customerId,
        roomName: booking.roomName,
        maPhong: booking.roomId,
        ngayDen: booking.checkInDate,
        ngayDi: booking.checkOutDate,
        trangThai: booking.status
      }));

    return {
      rooms: roomStats,
      bookings: bookingStats,
      revenue: revenueStats,
      staff: staffStats,
      recentBookings
    };
  } catch (error) {
    console.error('Lỗi khi lấy thống kê dashboard:', error);
    // Trả về dữ liệu mẫu nếu có lỗi
    return {
      rooms: { total: 21, available: 12, occupied: 6, maintenance: 3 },
      bookings: { today: 2, pending: 5, completed: 45, cancelled: 3 },
      revenue: { today: 2500000, week: 15000000, month: 65000000, average: 2166667 },
      staff: { total: 8, onDuty: 6, managers: 2, employees: 5, accountants: 1 },
      recentBookings: []
    };
  }
};

// API lấy chi tiết một đặt phòng theo Mã Đặt Phòng
export const getBookingDetails = async (maDatPhong: string) => {
  console.log(`Đang gọi API lấy chi tiết đặt phòng: ${API_BASE_URL}/DatPhong/${maDatPhong}`);
  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/DatPhong/${maDatPhong}`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });
    const data = await handleResponse(response);
    // Kiểm tra xem data có phải là object không, vì API có thể trả về lỗi dạng khác
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data; // Mong muốn là một object chứa thông tin đặt phòng
    } else {
      // Nếu API trả về mảng hoặc không phải object mong đợi khi lấy chi tiết 1 record
      console.error(`Dữ liệu chi tiết đặt phòng ${maDatPhong} không hợp lệ:`, data);
      // Trả về null hoặc throw error tùy theo cách muốn xử lý ở nơi gọi
      // Trong trường hợp này, trả về null để có thể bỏ qua nếu không tìm thấy
      return null;
    }
  } catch (error) {
    console.error(`Lỗi khi gọi API getBookingDetails cho ${maDatPhong}:`, error);
    // Quyết định trả về null để vòng lặp có thể tiếp tục thay vì dừng hẳn
    return null;
  }
};

// API lấy thông tin chi tiết một phòng theo Mã Phòng
export const getPhongById = async (maPhong: string): Promise<PhongDTO> => {
  console.log(`Đang gọi API lấy chi tiết phòng: ${API_BASE_URL}/Phong/${maPhong}`);
  try {
    const headers = await getAuthHeaders('GET'); // API này public, không cần token nhưng vẫn giữ header chung
    const response = await fetch(`${API_BASE_URL}/Phong/${maPhong}`, {
      method: 'GET',
      headers: headers,
    });
    // Không cần gọi handleResponse ở đây nếu API GET /Phong/{maPhong}
    // đã được cấu hình để trả về JSON chuẩn (kể cả khi lỗi 404 thì body vẫn là JSON)
    // Tuy nhiên, để nhất quán, có thể vẫn dùng handleResponse và nó sẽ throw lỗi nếu !response.ok
    if (!response.ok) {
        if (response.status === 404) {
            // Ném lỗi cụ thể để component có thể bắt và hiển thị thông báo
            throw new Error('RoomNotFound');
        }
        // Xử lý các lỗi khác nếu có
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Lỗi khi tải chi tiết phòng: ${response.status}`);
    }
    return response.json(); // parse và trả về PhongDTO

  } catch (error: any) {
    console.error('Lỗi kết nối API khi lấy chi tiết phòng:', error);
    if (error.message === 'RoomNotFound') {
        throw error; // Ném lại lỗi RoomNotFound để component xử lý
    }
    // Bạn có thể thêm xử lý lỗi cụ thể hơn ở đây nếu cần
    throw new Error('Không thể kết nối đến API chi tiết phòng. Vui lòng kiểm tra server backend và kết nối mạng.');
  }
};

// API lấy thông tin chi tiết một Loại Phòng theo Mã Loại Phòng
export const getLoaiPhongById = async (maLoaiPhong: string): Promise<LoaiPhongDTO> => {
  console.log(`Đang gọi API lấy chi tiết loại phòng: ${API_BASE_URL}/LoaiPhong/${maLoaiPhong}`);
  try {
    const headers = await getAuthHeaders('GET'); // API này public
    const response = await fetch(`${API_BASE_URL}/LoaiPhong/${maLoaiPhong}`, {
      method: 'GET',
      headers: headers,
    });
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('LoaiPhongNotFound');
        }
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Lỗi khi tải chi tiết loại phòng: ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error('Lỗi kết nối API khi lấy chi tiết loại phòng:', error);
    if (error.message === 'LoaiPhongNotFound') {
        throw error;
    }
    throw new Error('Không thể kết nối đến API chi tiết loại phòng.');
  }
};

// API lấy danh sách phòng theo loại phòng
export const getPhongByLoaiPhong = async (maLoaiPhong: string): Promise<PhongDTO[]> => {
  console.log(`Đang gọi API lấy danh sách phòng theo loại: ${API_BASE_URL}/Phong/GetPhongByLoai/${maLoaiPhong}`);
  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/Phong/GetPhongByLoai/${maLoaiPhong}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return []; // Trả về mảng rỗng nếu không tìm thấy phòng nào
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phòng theo loại:', err);
    throw new Error('Không thể kết nối đến API danh sách phòng theo loại.');
  }
};

// API đếm số phòng còn trống theo loại phòng
export const countAvailableRoomsByType = async (maLoaiPhong: string): Promise<number> => {
  try {
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/Phong/GetPhongByLoai/${maLoaiPhong}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    const rooms = data || [];
    
    // Đếm số phòng có trạng thái "Trống", "Còn trống" hoặc "Available"
    const availableRooms = rooms.filter((room: any) => {
      return room.trangThai === 'Trống' || room.trangThai === 'Còn trống' || room.trangThai === 'Available';
    });
    
    return availableRooms.length;
  } catch (err) {
    console.error('Lỗi khi đếm phòng còn trống:', err);
    return 0;
  }
};

// ===== MANAGER APIs =====

// API lấy danh sách đặt phòng cho manager
export const getManagerBookings = async () => {
  console.log(`Đang gọi API lấy danh sách đặt phòng cho manager: ${API_BASE_URL}/DatPhong`);
  return getEmployeeBookings(); // Sử dụng lại API employee
};

// API lấy danh sách phòng cho manager
export const getManagerRooms = async () => {
  console.log(`Đang gọi API lấy danh sách phòng cho manager: ${API_BASE_URL}/Phong`);
  return getEmployeeRooms(); // Sử dụng lại API employee
};

// API lấy danh sách dịch vụ cho manager
export const getManagerServices = async () => {
  console.log(`Đang gọi API lấy danh sách dịch vụ cho manager: ${API_BASE_URL}/DichVu`);
  return getServices(); // Sử dụng lại API có sẵn
};

// API lấy danh sách hóa đơn cho manager
export const getManagerInvoices = async () => {
  console.log(`Đang gọi API lấy danh sách hóa đơn cho manager: ${API_BASE_URL}/HoaDon`);
  return getInvoices(); // Sử dụng lại API có sẵn
};

// API lấy báo cáo doanh thu cho manager
export const getRevenueReport = async (startDate?: string, endDate?: string) => {
  try {
    console.log(`Đang gọi API báo cáo doanh thu: ${API_BASE_URL}/HoaDon`);

    const invoicesData = await getInvoices();

    // Lọc theo ngày nếu có
    let filteredInvoices = invoicesData;
    if (startDate && endDate) {
      filteredInvoices = invoicesData.filter(inv => {
        const invDate = new Date(inv.NgayLap || inv.ngayLap || inv.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return invDate >= start && invDate <= end;
      });
    }

    // Tính toán báo cáo
    const totalRevenue = filteredInvoices.reduce((sum, inv) =>
      sum + (parseFloat(inv.TongTien || inv.tongTien || inv.amount) || 0), 0
    );

    const totalInvoices = filteredInvoices.length;
    const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    // Báo cáo theo tháng
    const monthlyReport: { [key: string]: { revenue: number; count: number } } = {};
    filteredInvoices.forEach(inv => {
      const invDate = new Date(inv.NgayLap || inv.ngayLap || inv.date);
      const monthKey = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyReport[monthKey]) {
        monthlyReport[monthKey] = { revenue: 0, count: 0 };
      }

      monthlyReport[monthKey].revenue += parseFloat(inv.TongTien || inv.tongTien || inv.amount) || 0;
      monthlyReport[monthKey].count += 1;
    });

    return {
      totalRevenue,
      totalInvoices,
      averageInvoice,
      monthlyReport,
      invoices: filteredInvoices
    };
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo doanh thu:', error);
    return {
      totalRevenue: 0,
      totalInvoices: 0,
      averageInvoice: 0,
      monthlyReport: {},
      invoices: []
    };
  }
};

// API lấy danh sách nhân viên cho manager
export const getManagerStaffs = async () => {
  console.log(`Đang gọi API lấy danh sách nhân viên cho manager: ${API_BASE_URL}/NhanVien`);
  return getStaffs(); // Sử dụng lại API có sẵn
};

// API tạo nhân viên mới cho manager
export const createManagerStaff = async (staffData: any) => {
  console.log(`Đang gọi API tạo nhân viên mới cho manager:`, staffData);
  return createStaff(staffData); // Sử dụng lại API có sẵn
};

// API cập nhật nhân viên cho manager
export const updateManagerStaff = async (staffData: any) => {
  console.log(`Đang gọi API cập nhật nhân viên cho manager:`, staffData);
  return updateStaff(staffData); // Sử dụng lại API có sẵn
};

// API xóa nhân viên cho manager
export const deleteManagerStaff = async (staffId: string) => {
  console.log(`Đang gọi API xóa nhân viên cho manager: ${staffId}`);
  return deleteStaff(staffId); // Sử dụng lại API có sẵn
};

// ===== ACCOUNTANT APIs =====

// API lấy danh sách hóa đơn cho kế toán
export const getAccountantInvoices = async () => {
  try {
    console.log('Đang gọi API lấy danh sách hóa đơn cho kế toán');
    // Gọi API thật từ backend
    const headers = await getAuthHeaders('GET');
    const response = await fetch(`${API_BASE_URL}/HoaDon`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const invoicesData = await handleResponse(response);
    console.log('Raw invoices data for accountant:', invoicesData);
    // Lấy thêm thông tin đặt phòng và khách hàng
    const bookingsHeaders = await getAuthHeaders('GET');
    const customersHeaders = await getAuthHeaders('GET');
    const paymentsHeaders = await getAuthHeaders('GET');
    
    const [bookingsData, customersData, paymentsData] = await Promise.all([
      fetch(`${API_BASE_URL}/DatPhong`, {
        headers: bookingsHeaders,
        credentials: 'include'
      }).then(res => res.ok ? handleResponse(res) : []).catch(() => []),
      fetch(`${API_BASE_URL}/KhachHang`, {
        headers: customersHeaders,
        credentials: 'include'
      }).then(res => res.ok ? handleResponse(res) : []).catch(() => []),
      fetch(`${API_BASE_URL}/PhuongThucThanhToan`, {
        headers: paymentsHeaders,
        credentials: 'include'
      }).then(res => res.ok ? handleResponse(res) : []).catch(() => [])
    ]);
    // Map dữ liệu hóa đơn cho kế toán
    if (Array.isArray(invoicesData)) {
      return invoicesData.map((invoice) => {
        const booking = bookingsData.find((b: any) => (b.maDatPhong || b.MaDatPhong) === (invoice.maDatPhong || invoice.MaDatPhong));
        const customer = booking ? customersData.find((c: any) => (c.maKh || c.MaKh) === (booking.maKH || booking.MaKH)) : null;
        // Tìm thông tin thanh toán
        const payments = paymentsData.filter((p: any) => (p.maHoaDon || p.MaHoaDon) === (invoice.maHoaDon || invoice.MaHoaDon));
        return {
          id: invoice.maHoaDon || invoice.MaHoaDon,
          bookingId: invoice.maDatPhong || invoice.MaDatPhong,
          customerId: booking ? (booking.maKH || booking.MaKH) : '',
          customerName: customer ? `${customer.hoKh || customer.HoKh || ''} ${customer.tenKh || customer.TenKh || ''}`.trim() : 'Khách hàng',
          amount: parseFloat(invoice.tongTien || invoice.TongTien || 0),
          date: invoice.ngayTao || invoice.NgayTao || new Date().toISOString(),
          paymentMethod: payments.length > 0 ? (payments[0].phuongThucThanhToan1 || payments[0].PhuongThucThanhToan1 || 'Tiền mặt') : 'Tiền mặt',
          status: invoice.trangThai || invoice.TrangThai || 'Chưa thanh toán',
          note: ''
        };
      });
    }
    // Nếu không có dữ liệu, trả về mảng rỗng
    return [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hóa đơn cho kế toán:', error);
    throw error;
  }
};

// API lấy dữ liệu báo cáo cho kế toán
export const getAccountantReports = async (startDate?: string, endDate?: string) => {
  try {
    console.log(`Đang gọi API báo cáo cho kế toán từ ${startDate} đến ${endDate}`);

    const invoices = await getAccountantInvoices();

    // Lọc theo ngày nếu có
    let filteredInvoices = invoices;
    if (startDate && endDate) {
      filteredInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return invDate >= start && invDate <= end;
      });
    }

    // Tính toán báo cáo
    const totalRevenue = filteredInvoices
      .filter(inv => inv.status === 'Đã thanh toán')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const totalInvoices = filteredInvoices.length;
    const paidInvoices = filteredInvoices.filter(inv => inv.status === 'Đã thanh toán').length;
    const unpaidInvoices = filteredInvoices.filter(inv => inv.status === 'Chưa thanh toán').length;

    // Báo cáo theo ngày
    const dailyReport: { [date: string]: { revenue: number; count: number } } = {};
    filteredInvoices.forEach(inv => {
      if (inv.status === 'Đã thanh toán') {
        const invDate = new Date(inv.date);
        const dateKey = invDate.toISOString().split('T')[0];

        if (!dailyReport[dateKey]) {
          dailyReport[dateKey] = { revenue: 0, count: 0 };
        }

        dailyReport[dateKey].revenue += inv.amount;
        dailyReport[dateKey].count += 1;
      }
    });

    return {
      totalRevenue,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      dailyReport,
      invoices: filteredInvoices
    };
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo cho kế toán:', error);
    return {
      totalRevenue: 0,
      totalInvoices: 0,
      paidInvoices: 0,
      unpaidInvoices: 0,
      dailyReport: {},
      invoices: []
    };
  }
};

// API cập nhật trạng thái hóa đơn cho kế toán
export const updateAccountantInvoiceStatus = async (invoiceId: string, status: string) => {
  try {
    console.log(`Đang cập nhật trạng thái hóa đơn ${invoiceId} thành ${status}`);

    const authHeaders = await getAuthHeaders('PUT');
    const response = await fetch(`${API_BASE_URL}/HoaDon/${invoiceId}/trangthai`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ TrangThai: status })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await handleResponse(response);
    return { success: true, message: 'Cập nhật trạng thái thành công', data: result };
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái hóa đơn:', error);
    throw error;
  }
};

