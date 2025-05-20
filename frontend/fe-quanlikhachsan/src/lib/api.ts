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
  maDatPhong?: string;
  maKh?: string;
  maPhong?: string;
  thangThai?: string;
  ngayDat?: string;
  ngayDen?: string;
  ngayDi?: string;
  soDem?: number;
  soNguoi?: number;
  ghiChu?: string;
  tongTien?: number;
  hinhThucThanhToan?: string;
  [key: string]: string | number | undefined;
}

interface InvoiceData {
  maHoaDon?: string;
  maDatPhong?: string;
  maKh?: string;
  maNV?: string;
  ngayTao?: string;
  tongTien?: number;
  trangThai?: string;
  ghiChu?: string;
  maPttt?: string;
  ngayLap?: string;
  chiTietDichVu?: Array<{
    maDv: string;
    soLuong: number;
    donGia: number;
  }>;
  [key: string]: string | number | undefined | Array<{
    maDv: string;
    soLuong: number;
    donGia: number;
  }> | undefined;
}

interface RoomData {
  maPhong?: string;
  soPhong?: string | number;
  maLoaiPhong?: string;
  trangThai?: string;
  ngayTao?: string;
  tang?: string | number;
  thumbnail?: string;
  hinhAnh?: string;
  giaTien?: number;
  [key: string]: string | number | undefined;
}

interface StaffData {
  maNV?: string;
  hoNV?: string;
  tenNV?: string;
  ngaySinh?: string;
  gioiTinh?: string;
  diaChi?: string;
  soDienThoai?: string;
  email?: string;
  chucVu?: string;
  [key: string]: string | undefined;
}

interface ProfileData {
  maKh?: string;
  hoKh?: string;
  tenKh?: string;
  ngaySinh?: string;
  gioiTinh?: string;
  diaChi?: string;
  soDienThoai?: string;
  email?: string;
  soCccd?: string;
  [key: string]: string | undefined;
}

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

  const data = await handleResponse(response);

  // Chuyển đổi từ định dạng backend sang định dạng frontend
if (Array.isArray(data)) {
  return data.map(roomType => ({
    maLoaiPhong: roomType.maLoaiPhong,
    tenLoaiPhong: roomType.tenLoaiPhong,
    moTa: roomType.moTa,
    giaMoiDem: roomType.giaMoiDem || 0, 
    soGiuongNgu: roomType.soGiuongNgu || 0,
    kichThuocPhong: roomType.kichThuocPhong || 0,
    sucChua: roomType.sucChua || 0,
    thumbnail: roomType.thumbnail || ''
  }));
}

  return data;
};

// API Lấy danh sách loại phòng - endpoint từ Swagger
export const getRoomTypes = async () => {
  console.log(`Đang gọi API lấy danh sách loại phòng: ${API_BASE_URL}/LoaiPhong/Lấy danh sách tất cả loại phòng`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/LoaiPhong/Lấy danh sách tất cả loại phòng`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: getAuthHeaders('GET'),
    });

    const data = await handleResponse(response);
    console.log('Dữ liệu nhận về từ API getRoomTypes:', data);
    
    // Kiểm tra và xử lý dữ liệu
    if (Array.isArray(data)) {
      return data.map(roomType => ({
        ...roomType,
        donGia: typeof roomType.donGia === 'string' ? parseFloat(roomType.donGia) : (roomType.donGia || 0)
      }));
    }
    
    console.error('Dữ liệu roomTypes không phải mảng:', data);
    return [];
  } catch (error) {
    console.error('Lỗi khi gọi API getRoomTypes:', error);
    return [];
  }
};

// API Tạo phòng mới
export const createRoom = async (roomData: RoomData) => {
  console.log(`Đang gọi API tạo phòng mới: ${API_BASE_URL}/Phong/Tạo phòng mới`);

  // Chuyển đổi key từ camelCase sang PascalCase cho phù hợp với API
  const formData = new FormData();
  
  // Xử lý key name để phù hợp với API backend
  const keyMapping: Record<string, string> = {
    maLoaiPhong: 'MaLoaiPhong',
    soPhong: 'SoPhong',
    trangThai: 'TrangThai',
    ngayTao: 'NgayTao',
    tang: 'Tang',
    thumbnail: 'Thumbnail',
    hinhAnh: 'HinhAnh'
  };

  // Loại bỏ các trường không cần thiết và đảm bảo tên trường đúng với backend
  for (const key in roomData) {
    if (key !== 'tenLoaiPhong' && key !== 'maPhong' && key !== 'giaTien') {
      const backendKey = keyMapping[key] || key;
      if (roomData[key] !== undefined) {
        formData.append(backendKey, String(roomData[key] || ''));
      }
    }
  }
  
  console.log("Dữ liệu gửi đi:", Object.fromEntries(formData.entries()));
  
  const response = await fetch(`${API_BASE_URL}/Phong/Tạo phòng mới`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API Cập nhật phòng
export const updateRoom = async (maPhong: string, roomData: unknown) => {
  console.log(`Đang gọi API cập nhật phòng: ${API_BASE_URL}/Phong/Cập nhật phòng?maPhong=${maPhong}`);
  
  // Chuyển đổi key từ camelCase sang PascalCase cho phù hợp với API
  const formData = new FormData();
  
  // Xử lý key name để phù hợp với API backend
  const keyMapping: Record<string, string> = {
    maLoaiPhong: 'MaLoaiPhong',
    soPhong: 'SoPhong',
    trangThai: 'TrangThai',
    ngaySua: 'NgaySua',
    tang: 'Tang',
    thumbnail: 'Thumbnail',
    hinhAnh: 'HinhAnh'
  };

  // Loại bỏ các trường không cần thiết và đảm bảo tên trường đúng với backend
  for (const key in roomData as Record<string, any>) {
    if (key !== 'tenLoaiPhong' && key !== 'maPhong' && key !== 'giaTien') {
      const backendKey = keyMapping[key] || key;
      formData.append(backendKey, String((roomData as Record<string, any>)[key] || ''));
    }
  }
  
  console.log("Dữ liệu cập nhật:", Object.fromEntries(formData.entries()));
  
  const response = await fetch(`${API_BASE_URL}/Phong/Cập nhật phòng?maPhong=${maPhong}`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API Xóa phòng
export const deleteRoom = async (maPhong: string) => {
  console.log(`Đang gọi API xóa phòng: ${API_BASE_URL}/Phong/Xóa phòng?maPhong=${maPhong}`);
  
  const formData = new FormData();
  formData.append('maPhong', maPhong);
  
  const response = await fetch(`${API_BASE_URL}/Phong/Xóa phòng?maPhong=${maPhong}`, {
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API Đặt phòng - endpoint từ Swagger
export const bookRoom = async (bookingData: BookingData) => {
  const formData = new FormData();
  
  for (const key in bookingData) {
    formData.append(key, String(bookingData[key] || ''));
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
export const updateCustomerProfile = async (profileData: unknown) => {
  const formData = new FormData();
  
  for (const key in profileData as Record<string, any>) {
    formData.append(key, (profileData as Record<string, any>)[key]);
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
  for (const key in bookingInfo as Record<string, any>) {
    formData.append(key, (bookingInfo as Record<string, any>)[key]);
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
  
  try {
    const response = await fetch(`${API_BASE_URL}/DichVu/Lấy danh sách tất cả dịch vụ`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: getAuthHeaders('GET'),
    });

    const data = await handleResponse(response);
    console.log('Dữ liệu nhận về từ API getServices:', data);
    
    // Kiểm tra và xử lý dữ liệu
    if (Array.isArray(data)) {
      return data.map(service => ({
        ...service,
        donGia: typeof service.donGia === 'string' ? parseFloat(service.donGia) : (service.donGia || 0)
      }));
    }
    
    console.error('Dữ liệu services không phải mảng:', data);
    return [];
  } catch (error) {
    console.error('Lỗi khi gọi API getServices:', error);
    return [];
  }
};

// API Lấy khuyến mãi - endpoint từ Swagger
export const getPromotions = async () => {
  console.log(`Đang gọi API lấy khuyến mãi: ${API_BASE_URL}/KhuyenMai/Lấy danh sách tất cả khuyến mãi`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/KhuyenMai/Lấy danh sách tất cả khuyến mãi`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: getAuthHeaders('GET'),
    });

    const data = await handleResponse(response);
    console.log('Dữ liệu nhận về từ API getPromotions:', data);
    
    // Kiểm tra và xử lý dữ liệu
    if (Array.isArray(data)) {
      return data.map(promotion => ({
        ...promotion,
        phanTramGiam: typeof promotion.phanTramGiam === 'string' ? parseFloat(promotion.phanTramGiam) : (promotion.phanTramGiam || 0)
      }));
    }
    
    console.error('Dữ liệu promotions không phải mảng:', data);
    return [];
  } catch (error) {
    console.error('Lỗi khi gọi API getPromotions:', error);
    return [];
  }
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
export const createInvoice = async (invoiceData: InvoiceData) => {
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
export const updateInvoice = async (maHoaDon: string, invoiceData: InvoiceData) => {
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
export const createStaff = async (staffData: unknown) => {
  console.log(`Đang gọi API tạo nhân viên mới: ${API_BASE_URL}/NhanVien/Tạo nhân viên mới`);
  
  const formData = new FormData();
  for (const key in staffData as Record<string, any>) {
    if ((staffData as Record<string, any>)[key] !== undefined && (staffData as Record<string, any>)[key] !== null) {
      formData.append(key, String((staffData as Record<string, any>)[key]));
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
export const updateStaff = async (staffData: unknown) => {
  console.log(`Đang gọi API cập nhật nhân viên: ${API_BASE_URL}/NhanVien/Cập nhật nhân viên?maNv=${(staffData as Record<string, any>).maNv}`);
  
  const formData = new FormData();
  for (const key in staffData as Record<string, any>) {
    if ((staffData as Record<string, any>)[key] !== undefined && (staffData as Record<string, any>)[key] !== null) {
      formData.append(key, String((staffData as Record<string, any>)[key]));
    }
  }
  
  const response = await fetch(`${API_BASE_URL}/NhanVien/Cập nhật nhân viên?maNv=${(staffData as Record<string, any>).maNv}`, {
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
  console.log(`Đang gọi API xóa nhân viên: ${API_BASE_URL}/NhanVien/Xóa nhân viên?maNv=${maNV}`);
  
  const response = await fetch(`${API_BASE_URL}/NhanVien/Xóa nhân viên?maNv=${maNV}`, {
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('DELETE'),
  });

  return handleResponse(response);
};

// API để lấy danh sách đánh giá
export const getReviews = async () => {
  console.log(`Đang gọi API lấy danh sách đánh giá: ${API_BASE_URL}/Review/Lấy danh sách tất cả đánh giá`);
  
  const response = await fetch(`${API_BASE_URL}/Review/Lấy danh sách tất cả đánh giá`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });

  return handleResponse(response);
};

// API để duyệt đánh giá
export const approveReview = async (maReview: string, isApproved: boolean) => {
  console.log(`Đang gọi API duyệt đánh giá: ${API_BASE_URL}/Review/Cập nhật đánh giá?MaReview=${maReview}`);
  
  const formData = new FormData();
  formData.append('MaReview', maReview);
  formData.append('TrangThai', isApproved ? 'Đã duyệt' : 'Chưa duyệt');
  
  const response = await fetch(`${API_BASE_URL}/Review/Cập nhật đánh giá?MaReview=${maReview}`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
};

// API để lấy dữ liệu tổng quan cho dashboard
export const getDashboardStats = async () => {
  console.log(`Đang gọi API lấy thống kê dashboard: ${API_BASE_URL}/Dashboard/GetStats`);
  
  try {
    // Lấy thống kê phòng
    const roomsResponse = await fetch(`${API_BASE_URL}/Phong/Lấy danh sách tất cả phòng`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: getAuthHeaders('GET'),
    });
    
    const roomsData = await handleResponse(roomsResponse);
    
    // Lấy thống kê đặt phòng
    const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong/Lấy danh sách đặt phòng`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: getAuthHeaders('GET'),
    });
    
    const bookingsData = await handleResponse(bookingsResponse);
    
    // Lấy thống kê hóa đơn và doanh thu
    const invoicesResponse = await fetch(`${API_BASE_URL}/HoaDon/Lấy danh sách tất cả hóa đơn`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: getAuthHeaders('GET'),
    });
    
    const invoicesData = await handleResponse(invoicesResponse);
    
    // Lấy thống kê nhân viên
    const staffsResponse = await fetch(`${API_BASE_URL}/NhanVien/Lấy danh sách tất cả nhân viên`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: getAuthHeaders('GET'),
    });
    
    const staffsData = await handleResponse(staffsResponse);
    
    // Xử lý và tính toán thống kê từ dữ liệu
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Thống kê phòng
    const roomsStats = {
      total: Array.isArray(roomsData) ? roomsData.length : 0,
      available: Array.isArray(roomsData) ? roomsData.filter(room => room.trangThai === 'Trống').length : 0,
      occupied: Array.isArray(roomsData) ? roomsData.filter(room => room.trangThai === 'Đã đặt' || room.trangThai === 'Đang ở').length : 0,
      maintenance: Array.isArray(roomsData) ? roomsData.filter(room => room.trangThai === 'Đang dọn' || room.trangThai === 'Bảo trì').length : 0
    };
    
    // Thống kê đặt phòng
    const bookingsToday = Array.isArray(bookingsData) ? bookingsData.filter(booking => {
      const bookingDate = new Date(booking.ngayDen);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime();
    }).length : 0;
    
    const bookingsPending = Array.isArray(bookingsData) ? bookingsData.filter(booking => booking.trangThai === 'Đã đặt').length : 0;
    const bookingsCompleted = Array.isArray(bookingsData) ? bookingsData.filter(booking => booking.trangThai === 'Đã trả phòng').length : 0;
    const bookingsCancelled = Array.isArray(bookingsData) ? bookingsData.filter(booking => booking.trangThai === 'Đã hủy').length : 0;
    
    const bookingsStats = {
      today: bookingsToday,
      pending: bookingsPending,
      completed: bookingsCompleted,
      cancelled: bookingsCancelled
    };
    
    // Thống kê hóa đơn và doanh thu
    const invoicesToday = Array.isArray(invoicesData) ? invoicesData.filter(invoice => {
      const invoiceDate = new Date(invoice.ngayLap);
      invoiceDate.setHours(0, 0, 0, 0);
      return invoiceDate.getTime() === today.getTime();
    }) : [];
    
    // Tính tổng doanh thu ngày hôm nay
    const revenueToday = invoicesToday.reduce((sum, invoice) => sum + (invoice.tongTien || 0), 0);
    
    // Tính doanh thu tuần
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const invoicesThisWeek = Array.isArray(invoicesData) ? invoicesData.filter(invoice => {
      const invoiceDate = new Date(invoice.ngayLap);
      return invoiceDate >= weekStart && invoiceDate <= today;
    }) : [];
    
    const revenueWeek = invoicesThisWeek.reduce((sum, invoice) => sum + (invoice.tongTien || 0), 0);
    
    // Tính doanh thu tháng
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const invoicesThisMonth = Array.isArray(invoicesData) ? invoicesData.filter(invoice => {
      const invoiceDate = new Date(invoice.ngayLap);
      return invoiceDate >= monthStart && invoiceDate <= today;
    }) : [];
    
    const revenueMonth = invoicesThisMonth.reduce((sum, invoice) => sum + (invoice.tongTien || 0), 0);
    
    // Tính doanh thu trung bình ngày trong tháng
    const daysInMonth = today.getDate();
    const revenueAvg = daysInMonth > 0 ? revenueMonth / daysInMonth : 0;
    
    const revenueStats = {
      today: revenueToday,
      week: revenueWeek,
      month: revenueMonth,
      average: revenueAvg
    };
    
    // Thống kê nhân viên
    const staffStats = {
      total: Array.isArray(staffsData) ? staffsData.length : 0,
      onDuty: Math.floor(Array.isArray(staffsData) ? staffsData.length / 3 : 0), // Giả định 1/3 nhân viên đang trực
      managers: Array.isArray(staffsData) ? staffsData.filter(staff => staff.chucVu === 'Quản lý').length : 0,
      employees: Array.isArray(staffsData) ? staffsData.filter(staff => staff.chucVu !== 'Quản lý' && staff.chucVu !== 'Kế toán').length : 0,
      accountants: Array.isArray(staffsData) ? staffsData.filter(staff => staff.chucVu === 'Kế toán').length : 0
    };
    
    return {
      rooms: roomsStats,
      bookings: bookingsStats,
      revenue: revenueStats,
      staff: staffStats,
      recentBookings: Array.isArray(bookingsData) 
        ? bookingsData
          .sort((a, b) => new Date(b.ngayDen).getTime() - new Date(a.ngayDen).getTime())
          .slice(0, 5)
        : []
    };
    
  } catch (error) {
    console.error("Lỗi khi lấy thống kê dashboard:", error);
    throw error;
  }
};

// API để lấy và cập nhật trạng thái phòng cho nhân viên
export const getEmployeeRooms = async () => {
  console.log(`Đang gọi API lấy danh sách phòng cho nhân viên: ${API_BASE_URL}/Phong/Lấy danh sách tất cả phòng`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/Phong/Lấy danh sách tất cả phòng`, {
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
        // Ưu tiên sử dụng giaMoiDem, nếu không có thì dùng giaMoiGio, nếu không có cả hai thì dùng giaTien hoặc 0
        const roomPrice = room.giaMoiDem || room.giaMoiGio || room.giaTien || 0;
        
        return {
          id: room.maPhong,
          name: room.soPhong,
          type: room.maLoaiPhong, // Cần bổ sung thêm tên loại phòng
          price: roomPrice,
          status: room.trangThai,
          tang: room.tang || 1
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
export const updateRoomStatus = async (maPhong: string, trangThai: string) => {
  console.log(`Đang gọi API cập nhật trạng thái phòng: ${API_BASE_URL}/Phong/Cập nhật trạng thái phòng?maPhong=${maPhong}`);
  
  const formData = new FormData();
  formData.append('MaPhong', maPhong);
  formData.append('TrangThai', trangThai);
  
  const response = await fetch(`${API_BASE_URL}/Phong/Cập nhật trạng thái phòng?maPhong=${maPhong}&trangThai=${trangThai}`, {
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
  console.log(`Đang gọi API lấy danh sách đặt phòng cho nhân viên: ${API_BASE_URL}/DatPhong/Lấy danh sách đặt phòng`);
  
  const response = await fetch(`${API_BASE_URL}/DatPhong/Lấy danh sách đặt phòng`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });

  const bookingsData = await handleResponse(response);
  
  // Lấy thêm thông tin khách hàng
  const customersResponse = await fetch(`${API_BASE_URL}/KhachHang/Lấy danh sách tất cả khách hàng`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });
  
  const customersData = await handleResponse(customersResponse);
  const customers = Array.isArray(customersData) ? customersData : [];
  
  // Lấy thêm thông tin phòng
  const roomsResponse = await fetch(`${API_BASE_URL}/Phong/Lấy danh sách tất cả phòng`, {
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
      const customer = customers.find(c => c.maKh === booking.maKh) || {};
      const room = rooms.find(r => r.maPhong === booking.maPhong) || {};
      
      return {
        id: booking.maDatPhong,
        customerId: booking.maKh,
        customerName: customer.hoKh && customer.tenKh ? `${customer.hoKh} ${customer.tenKh}` : 'Không xác định',
        roomId: booking.maPhong,
        roomName: room.soPhong || 'Không xác định',
        checkInDate: booking.ngayDen,
        checkOutDate: booking.ngayDi,
        status: booking.trangThai,
        note: booking.ghiChu || '',
        totalPrice: booking.tongTien || 0,
        phoneNumber: customer.soDienThoai || '',
        email: customer.email || ''
      };
    });
  }

  return [];
};

// API cập nhật trạng thái đặt phòng cho nhân viên
export const updateBookingStatus = async (maDatPhong: string, trangThai: string) => {
  console.log(`Đang gọi API cập nhật trạng thái đặt phòng: ${API_BASE_URL}/DatPhong/Cập nhật đặt phòng?maDatPhong=${maDatPhong}`);
  
  // Đầu tiên lấy thông tin đặt phòng hiện tại
  const getResponse = await fetch(`${API_BASE_URL}/DatPhong/Tìm đặt phòng theo ID?maDatPhong=${maDatPhong}`, {
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
  formData.set('TrangThai', trangThai);
  
  const response = await fetch(`${API_BASE_URL}/DatPhong/Cập nhật đặt phòng?maDatPhong=${maDatPhong}`, {
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
  console.log(`Đang gọi API tạo đặt phòng mới: ${API_BASE_URL}/DatPhong/Tạo đặt phòng mới`);
  
  const formData = new FormData();
  
  // Chuyển đổi key từ camelCase sang PascalCase cho phù hợp với API
  const keyMapping: Record<string, string> = {
    maKh: 'MaKh',
    maPhong: 'MaPhong',
    ngayDen: 'NgayDen',
    ngayDi: 'NgayDi',
    trangThai: 'TrangThai',
    ghiChu: 'GhiChu',
  };

  for (const key in bookingData) {
    const backendKey = keyMapping[key] || key;
    formData.append(backendKey, String(bookingData[key] || ''));
  }
  
  const response = await fetch(`${API_BASE_URL}/DatPhong/Tạo đặt phòng mới`, {
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
  console.log(`Đang gọi API lấy danh sách hóa đơn cho nhân viên: ${API_BASE_URL}/HoaDon/Lấy danh sách tất cả hóa đơn`);
  
  const response = await fetch(`${API_BASE_URL}/HoaDon/Lấy danh sách tất cả hóa đơn`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });

  const invoicesData = await handleResponse(response);
  
  // Lấy thông tin đặt phòng
  const bookingsResponse = await fetch(`${API_BASE_URL}/DatPhong/Lấy danh sách đặt phòng`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: getAuthHeaders('GET'),
  });
  
  const bookingsData = await handleResponse(bookingsResponse);
  const bookings = Array.isArray(bookingsData) ? bookingsData : [];
  
  // Lấy thông tin khách hàng
  const customersResponse = await fetch(`${API_BASE_URL}/KhachHang/Lấy danh sách tất cả khách hàng`, {
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
      const booking = bookings.find(b => b.maDatPhong === invoice.maDatPhong) || {};
      const customer = customers.find(c => c.maKh === booking.maKh) || {};
      
      return {
        id: invoice.maHoaDon,
        bookingId: invoice.maDatPhong,
        customerId: booking.maKh || '',
        customerName: customer.hoKh && customer.tenKh ? `${customer.hoKh} ${customer.tenKh}` : 'Không xác định',
        amount: invoice.tongTien || 0,
        date: invoice.ngayLap || new Date().toISOString(),
        paymentMethod: invoice.maPttt || '',
        status: invoice.trangThai || 'Chưa thanh toán',
        note: invoice.ghiChu || ''
      };
    });
  }

  return [];
};

// API tạo hóa đơn mới cho nhân viên
export const createEmployeeInvoice = async (invoiceData: InvoiceData) => {
  console.log(`Đang gọi API tạo hóa đơn mới: ${API_BASE_URL}/HoaDon/Tạo hóa đơn mới`);
  
  const formData = new FormData();
  
  // Chuyển đổi key từ camelCase sang PascalCase cho phù hợp với API
  const keyMapping: Record<string, string> = {
    maDatPhong: 'MaDatPhong',
    tongTien: 'TongTien',
    maPttt: 'MaPttt',
    trangThai: 'TrangThai',
    ghiChu: 'GhiChu',
    ngayLap: 'NgayLap'
  };

  for (const key in invoiceData) {
    const backendKey = keyMapping[key] || key;
    formData.append(backendKey, String(invoiceData[key] || ''));
  }
  
  // Nếu không có ngày lập, thêm ngày hiện tại
  if (!(invoiceData as Record<string, any>).ngayLap) {
    formData.append('NgayLap', new Date().toISOString());
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

// API cập nhật trạng thái hóa đơn cho nhân viên
export const updateInvoiceStatus = async (maHoaDon: string, trangThai: string) => {
  console.log(`Đang gọi API cập nhật trạng thái hóa đơn: ${API_BASE_URL}/HoaDon/Cập nhật trạng thái hóa đơn?maHoaDon=${maHoaDon}`);
  
  const formData = new FormData();
  formData.append('MaHoaDon', maHoaDon);
  formData.append('TrangThai', trangThai);
  
  const response = await fetch(`${API_BASE_URL}/HoaDon/Cập nhật trạng thái hóa đơn?maHoaDon=${maHoaDon}&trangThai=${trangThai}`, {
    method: 'PUT',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    headers: getFormDataHeaders(),
  });

  return handleResponse(response);
}; 