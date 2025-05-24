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

interface StaffData {
  staffId?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  position?: string;
  [key: string]: string | undefined;
}

interface ProfileData {
  customerId?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  idNumber?: string;
  [key: string]: string | undefined;
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

// API lấy danh sách phòng
export const getRooms = async () => {
  console.log(`Đang gọi API lấy danh sách phòng: ${API_BASE_URL}/Phong`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/Phong`, {
    method: 'GET',
    headers: getAuthHeaders('GET'),
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
    const response = await fetch(`${API_BASE_URL}/LoaiPhong`, {
      method: 'GET',
      headers: getAuthHeaders('GET'),
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
    const response = await fetch(`${API_BASE_URL}/Phong`, {
    method: 'POST',
    headers: getFormDataHeaders(),
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
    const response = await fetch(`${API_BASE_URL}/Phong/${roomId}`, {
    method: 'PUT',
    headers: getFormDataHeaders(),
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
    const response = await fetch(`${API_BASE_URL}/Phong/${roomId}`, {
    method: 'DELETE',
      headers: getAuthHeaders('DELETE'),
      credentials: 'include'
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi gọi API deleteRoom:', error);
    throw error;
  }
};

// API đặt phòng
export const bookRoom = async (bookingData: BookingData) => {
  console.log(`Đang gọi API đặt phòng: ${API_BASE_URL}/DatPhong`, bookingData);
  
  try {
    const response = await fetch(`${API_BASE_URL}/DatPhong`, {
    method: 'POST',
      headers: getAuthHeaders('POST'),
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
    const response = await fetch(`${API_BASE_URL}/KhachHang/${customerId}`, {
      method: 'GET',
      headers: getAuthHeaders('GET'),
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
    
    const response = await fetch(`${API_BASE_URL}/KhachHang`, {
    method: 'PUT',
    headers: getFormDataHeaders(),
      body: formData,
      credentials: 'include'
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ:', error);
    throw error;
  }
};

// API lấy lịch sử đặt phòng của khách hàng (hoặc tất cả nếu customerId rỗng)
export const getBookingHistory = async (customerId: string) => { // customerId có thể không dùng nếu API endpoint không hỗ trợ
  console.log(`Đang gọi API lấy lịch sử đặt phòng: ${API_BASE_URL}/DatPhong`);
  try {
    // Hiện tại API backend /DatPhong là lấy tất cả, không có filter theo customerId trực tiếp ở endpoint này
    const url = `${API_BASE_URL}/DatPhong`; 
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders('GET'),
      credentials: 'include'
    });
    const data = await handleResponse(response);
    // Trả về dữ liệu gốc từ DatPhongDTO, không map lại tên trường
    // Ví dụ: data sẽ có MaDatPhong, MaKH, NgayNhanPhong, NgayTraPhong, TrangThai
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error('Lỗi khi gọi API getBookingHistory:', error);
    throw error;
  }
};

// API hủy đặt phòng
export const cancelBooking = async (bookingId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/DatPhong/${bookingId}/cancel`, {
    method: 'PUT',
      headers: getAuthHeaders('PUT'),
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
    const response = await fetch(`${API_BASE_URL}/DichVu`, {
      method: 'GET',
      headers: getAuthHeaders('GET'),
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
    const response = await fetch(`${API_BASE_URL}/KhuyenMai`, {
      method: 'GET',
      headers: getAuthHeaders('GET'),
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
    const response = await fetch(`${API_BASE_URL}/HoaDon`, {
      method: 'GET',
      headers: getAuthHeaders('GET'),
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
    const response = await fetch(`${API_BASE_URL}/HoaDon/${invoiceId}`, {
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_BASE_URL}/HoaDon`, {
    method: 'POST',
      headers: getAuthHeaders('POST'),
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
    const response = await fetch(`${API_BASE_URL}/HoaDon/${invoiceId}/trangthai?trangThai=${encodeURIComponent(status)}`, {
      method: 'PUT',
      headers: getAuthHeaders('PUT'), // Content-Type là application/json dù không có body
      credentials: 'include',
      // Body không cần thiết vì trạng thái được gửi qua query param
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi gọi API updateInvoiceStatus:', error);
    throw error;
  }
};

// API xóa hóa đơn
export const deleteInvoice = async (invoiceId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/HoaDon/${invoiceId}`, {
    method: 'DELETE',
    headers: getAuthHeaders('DELETE'),
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
    const response = await fetch(`${API_BASE_URL}/HoaDon/doanhthu?month=${month}&year=${year}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`Lỗi khi tính doanh thu tháng ${month}/${year}:`, error);
    throw error;
  }
};

// API lấy danh sách nhân viên
export const getStaffs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/NhanVien`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    return await handleResponse(response);
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
    
    const response = await fetch(`${API_BASE_URL}/NhanVien`, {
    method: 'POST',
    headers: getFormDataHeaders(),
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
    
    const response = await fetch(`${API_BASE_URL}/NhanVien/${staffId}`, {
    method: 'PUT',
    headers: getFormDataHeaders(),
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
    const response = await fetch(`${API_BASE_URL}/NhanVien/${staffId}`, {
    method: 'DELETE',
    headers: getAuthHeaders('DELETE'),
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
    const response = await fetch(`${API_BASE_URL}/Review`, {
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_BASE_URL}/Review/${reviewId}/approve`, {
    method: 'PUT',
      headers: getAuthHeaders('PUT'),
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
    const response = await fetch(`${API_BASE_URL}/Phong`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: getAuthHeaders('GET'),
    });

    const data = await handleResponse(response);
    console.log('Dữ liệu phòng từ API:', data);

    // Chuyển đổi từ định dạng backend sang định dạng frontend
    if (Array.isArray(data)) {
      return data.map(room => {
        // Ưu tiên sử dụng pricePerNight, nếu không có thì dùng price, nếu không có cả hai thì dùng price hoặc 0
        const roomPrice = room.pricePerNight || room.price || 0;
        
        return {
          id: room.roomId,
          name: room.roomNumber,
          type: room.roomTypeId, // Cần bổ sung thêm tên loại phòng
          price: roomPrice,
          status: room.status,
          tang: room.floor || 1
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
  
  const response = await fetch(`${API_BASE_URL}/Phong/${roomId}`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API lấy danh sách đặt phòng cho nhân viên
export const getEmployeeBookings = async () => {
  console.log(`Đang gọi API lấy danh sách đặt phòng cho nhân viên: ${API_BASE_URL}/DatPhong`);
  
  const response = await fetch(`${API_BASE_URL}/DatPhong`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });

  const bookingsData = await handleResponse(response);
  
  // Lấy thêm thông tin khách hàng
  const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });
  
  const customersData = await handleResponse(customersResponse);
  const customers = Array.isArray(customersData) ? customersData : [];
  
  // Lấy thêm thông tin phòng
  const roomsResponse = await fetch(`${API_BASE_URL}/Phong`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });
  
  const roomsData = await handleResponse(roomsResponse);
  const rooms = Array.isArray(roomsData) ? roomsData : [];

  // Chuyển đổi từ định dạng backend sang định dạng frontend
  if (Array.isArray(bookingsData)) {
    return bookingsData.map(booking => {
      const customer = customers.find(c => c.customerId === booking.customerId) || {};
      const room = rooms.find(r => r.roomId === booking.roomId) || {};
      
      return {
        id: booking.bookingId,
        customerId: booking.customerId,
        customerName: customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : 'Không xác định',
        roomId: booking.roomId,
        roomName: room.roomNumber || 'Không xác định',
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        status: booking.status,
        note: booking.notes || '',
        totalPrice: booking.totalAmount || 0,
        phoneNumber: customer.phone || '',
        email: customer.email || ''
      };
    });
  }

  return [];
};

// API cập nhật trạng thái đặt phòng cho nhân viên
export const updateBookingStatus = async (bookingId: string, status: string) => {
  console.log(`Đang gọi API cập nhật trạng thái đặt phòng: ${API_BASE_URL}/DatPhong/${bookingId}`);
  
  // Đầu tiên lấy thông tin đặt phòng hiện tại
  const getResponse = await fetch(`${API_BASE_URL}/DatPhong/${bookingId}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
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
  
  const response = await fetch(`${API_BASE_URL}/DatPhong/${bookingId}`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
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
  
  const response = await fetch(`${API_BASE_URL}/DatPhong`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API lấy danh sách hóa đơn cho nhân viên
export const getEmployeeInvoices = async () => {
  console.log(`Đang gọi API lấy danh sách hóa đơn cho nhân viên: ${API_BASE_URL}/HoaDon`);
  
  const response = await fetch(`${API_BASE_URL}/HoaDon`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });

  const invoicesData = await handleResponse(response);
  
  // Lấy thông tin đặt phòng
  const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });
  
  const bookingsData = await handleResponse(bookingsResponse);
  const bookings = Array.isArray(bookingsData) ? bookingsData : [];
  
  // Lấy thông tin khách hàng
  const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });
  
  const customersData = await handleResponse(customersResponse);
  const customers = Array.isArray(customersData) ? customersData : [];

  // Chuyển đổi từ định dạng backend sang định dạng frontend
  if (Array.isArray(invoicesData)) {
    return invoicesData.map(invoice => {
      const booking = bookings.find(b => b.bookingId === invoice.bookingId) || {};
      const customer = customers.find(c => c.customerId === booking.customerId) || {};
      
      return {
        id: invoice.invoiceId,
        bookingId: booking.bookingId,
        customerId: booking.customerId || '',
        customerName: customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : 'Không xác định',
        amount: invoice.totalAmount || 0,
        date: invoice.issueDate || new Date().toISOString(),
        paymentMethod: invoice.paymentMethodId || '',
        status: invoice.status || 'Chưa thanh toán',
        note: invoice.notes || ''
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
  
  const response = await fetch(`${API_BASE_URL}/HoaDon`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API lấy thống kê dashboard cho nhân viên
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Dashboard/stats`, {
      headers: getAuthHeaders('GET'),
      credentials: 'include'
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi lấy thống kê dashboard:', error);
    // Trả về dữ liệu mẫu nếu API chưa sẵn sàng
    return {
      rooms: {
        total: 30,
        available: 12,
        occupied: 15,
        maintenance: 3
      },
      bookings: {
        today: 5,
        pending: 8,
        completed: 120,
        cancelled: 10
      },
      revenue: {
        today: 12500000,
        week: 87500000,
        month: 350000000,
        average: 4166667
      },
      staff: {
        total: 15,
        onDuty: 8,
        managers: 2,
        employees: 10,
        accountants: 3
      },
      recentBookings: [
        {
          maDatPhong: "DP001",
          customerName: "Nguyễn Văn A",
          maKh: "KH001",
          roomName: "101",
          maPhong: "P101",
          ngayDen: "2023-11-15",
          ngayDi: "2023-11-18",
          trangThai: "Đã xác nhận"
        },
        {
          maDatPhong: "DP002",
          customerName: "Trần Thị B",
          maKh: "KH002",
          roomName: "202",
          maPhong: "P202",
          ngayDen: "2023-11-16",
          ngayDi: "2023-11-20",
          trangThai: "Đang xử lý"
        },
        {
          maDatPhong: "DP003",
          customerName: "Lê Văn C",
          maKh: "KH003",
          roomName: "305",
          maPhong: "P305",
          ngayDen: "2023-11-17",
          ngayDi: "2023-11-19",
          trangThai: "Đã thanh toán"
        }
      ]
    };
  }
};

// API lấy chi tiết một đặt phòng theo Mã Đặt Phòng
export const getBookingDetails = async (maDatPhong: string) => {
  console.log(`Đang gọi API lấy chi tiết đặt phòng: ${API_BASE_URL}/DatPhong/${maDatPhong}`);
  try {
    const response = await fetch(`${API_BASE_URL}/DatPhong/${maDatPhong}`, {
      method: 'GET',
      headers: getAuthHeaders('GET'),
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