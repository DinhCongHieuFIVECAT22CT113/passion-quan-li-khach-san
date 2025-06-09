/**
 * Đại diện cho thông tin chi tiết của một loại phòng.
 */
export interface LoaiPhongDTO {
    maLoaiPhong: string;
    tenLoaiPhong: string;
    moTa?: string; // Mô tả chi tiết về loại phòng
    giaMoiGio?: number; // Giá mỗi giờ
    giaMoiDem: number; // Giá mỗi đêm
    soPhongTam?: number; // Số phòng tắm
    soGiuongNgu: number; // Số giường ngủ
    giuongDoi?: number; // Số giường đôi
    giuongDon?: number; // Số giường đơn
    kichThuocPhong: number; // Kích thước phòng (m²)
    sucChua: number; // Số người tối đa
    thumbnail?: string; // Thumbnail image
}

/**
 * DTO cho việc tạo loại phòng mới
 */
export interface CreateLoaiPhongDTO {
    tenLoaiPhong: string;
    moTa?: string;
    giaMoiGio: number;
    giaMoiDem: number;
    soPhongTam: number;
    soGiuongNgu: number;
    giuongDoi?: number;
    giuongDon?: number;
    kichThuocPhong: number;
    sucChua: number;
    thumbnail?: File;
}

/**
 * DTO cho việc cập nhật loại phòng
 */
export interface UpdateLoaiPhongDTO {
    tenLoaiPhong: string;
    moTa?: string;
    giaMoiGio: number;
    giaMoiDem: number;
    soPhongTam: number;
    soGiuongNgu: number;
    giuongDoi?: number;
    giuongDon?: number;
    kichThuocPhong: number;
    sucChua: number;
    thumbnail?: File;
}

/**
 * Đại diện cho thông tin cơ bản của một phòng.
 */
export interface PhongDTO {
    maPhong: string;
    maLoaiPhong: string;
    soPhong?: string;
    thumbnail?: string | null; // URL ảnh thumbnail của phòng
    hinhAnh?: string[] | null;   // Chuỗi các URL hình ảnh khác, cách nhau bởi dấu phẩy
    trangThai: string;        // Ví dụ: "Trống", "Đã đặt", "Đang sử dụng", "Đang dọn"
    tang?: number;
    loaiPhong?: LoaiPhongDTO; // Thông tin chi tiết loại phòng (sẽ cần nếu API backend trả về)
}

/**
 * Đại diện cho thông tin khuyến mãi.
 */
export interface KhuyenMaiDTO {
    maKm: string;
    tenKhuyenMai: string;
    thumbnail?: string;
    moTa: string;
    maGiamGia: string;
    phanTramGiam: number;
    soTienGiam: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    trangThai: string;
}

/**
 * DTO cho việc tạo khuyến mãi mới
 */
export interface CreateKhuyenMaiDTO {
    tenKhuyenMai: string;
    thumbnail?: File;
    moTa: string;
    maGiamGia: string;
    phanTramGiam: number;
    soTienGiam: number;
    ngayBatDau: string;
    ngayKetThuc: string;
}

/**
 * DTO cho việc cập nhật khuyến mãi
 */
export interface UpdateKhuyenMaiDTO {
    tenKhuyenMai: string;
    thumbnail?: File;
    moTa: string;
    maGiamGia: string;
    phanTramGiam: number;
    soTienGiam: number;
    ngayBatDau: string;
    ngayKetThuc: string;
}