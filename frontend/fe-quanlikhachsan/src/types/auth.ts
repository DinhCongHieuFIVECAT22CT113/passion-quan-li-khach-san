// DTO cho đăng nhập
export interface UserLoginDto {
  userName: string;
  password: string;
}

// DTO cho đăng ký
export interface UserRegisterDto {
  userName: string;
  password: string;
  confirmPassword: string;
  hoKh: string;
  tenKh: string;
  email: string;
  soCccd: string;
  soDienThoai: string;
}

// DTO trả về sau khi đăng nhập hoặc đăng ký
export interface UserDto {
  maNguoiDung: string;
  userName: string;
  hoTen: string;
  maRole?: string;
  token: string;
}

// Interface cho thông tin khách hàng
export interface CustomerProfile {
  maKh: string;
  hoKh: string;
  tenKh: string;
  email: string;
  soCccd: string;
  soDienThoai: string;
  avatarSrc?: string;
  maLoaiKh?: string;
}

// Interface cho thông tin đặt phòng
export interface BookingInfo {
  maDatPhong: string;
  maKh: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  soNguoi: number;
  thoiGianDen: string;
  giaGoc: number;
  tongTien: number;
  trangThai: string;
}

// Interface cho chi tiết đặt phòng
export interface BookingDetail {
  maChiTietDatPhong: string;
  maDatPhong: string;
  maPhong?: string;
  maLoaiPhong: string;
  giaTien: number;
  soLuong: number;
  thanhTien: number;
  trangThai: string;
}

// Interface cho thông tin phòng
export interface Room {
  maPhong: string;
  tenPhong: string;
  maLoaiPhong: string;
  trangThai: string;
  moTa?: string;
  hinhAnh?: string;
}

// Interface cho loại phòng
export interface RoomType {
  maLoaiPhong: string;
  tenLoaiPhong: string;
  donGia: number;
  soGiuong: number;
  soNguoi: number;
  dienTich: number;
  moTa?: string;
  hinhAnh?: string;
} 