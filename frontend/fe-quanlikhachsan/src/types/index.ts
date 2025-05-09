// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: User;
}

// User Types
export interface User {
    id: number;
    email: string;
    hoTen: string;
    soDienThoai: string;
    vaiTro: string;
}

// Room Types
export interface LoaiPhong {
    id: number;
    tenLoaiPhong: string;
    moTa: string;
    giaPhong: number;
}

export interface Phong {
    id: number;
    maPhong: string;
    loaiPhongId: number;
    trangThai: string;
    loaiPhong: LoaiPhong;
}

// Booking Types
export interface DatPhong {
    id: number;
    khachHangId: number;
    ngayDat: Date;
    ngayNhanPhong: Date;
    ngayTraPhong: Date;
    trangThai: string;
    tongTien: number;
    khachHang: KhachHang;
    chiTietDatPhongs: ChiTietDatPhong[];
}

export interface ChiTietDatPhong {
    id: number;
    datPhongId: number;
    phongId: number;
    giaPhong: number;
    phong: Phong;
}

// Customer Types
export interface KhachHang {
    id: number;
    hoTen: string;
    email: string;
    soDienThoai: string;
    diaChi: string;
}

// Service Types
export interface DichVu {
    id: number;
    tenDichVu: string;
    moTa: string;
    gia: number;
}

export interface SuDungDichVu {
    id: number;
    datPhongId: number;
    dichVuId: number;
    soLuong: number;
    ngaySuDung: Date;
    tongTien: number;
    dichVu: DichVu;
}

// Promotion Types
export interface KhuyenMai {
    id: number;
    tenKhuyenMai: string;
    moTa: string;
    ngayBatDau: Date;
    ngayKetThuc: Date;
    phanTramGiamGia: number;
}

// Payment Types
export interface PhuongThucThanhToan {
    id: number;
    tenPhuongThuc: string;
    moTa: string;
}

// Invoice Types
export interface HoaDon {
    id: number;
    datPhongId: number;
    ngayLap: Date;
    tongTien: number;
    trangThai: string;
    datPhong: DatPhong;
} 