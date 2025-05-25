/**
 * Đại diện cho thông tin chi tiết của một loại phòng.
 */
export interface LoaiPhongDTO {
    maLoaiPhong: string;
    tenLoaiPhong: string;
    moTa?: string; // Mô tả chi tiết về loại phòng
    giaMoiGio: number;
    giaMoiDem: number;
    hinhAnh?: string; // URL hình ảnh đại diện cho loại phòng
    tienNghi?: string[]; // Danh sách các tiện nghi, ví dụ: ["TV", "Máy lạnh", "Wifi"]
    dienTich?: number; // Diện tích phòng
    soGiuong?: number; // Số giường
    loaiGiuong?: string; // Loại giường, ví dụ: "King", "Queen", "Twin"
    sucChua?: number; // Số người tối đa
}

/**
 * Đại diện cho thông tin cơ bản của một phòng.
 */
export interface PhongDTO {
    maPhong: string;
    maLoaiPhong: string;
    soPhong: string;
    thumbnail?: string | null; // URL ảnh thumbnail của phòng
    hinhAnh?: string | null;   // Chuỗi các URL hình ảnh khác, cách nhau bởi dấu phẩy
    trangThai: string;        // Ví dụ: "Trống", "Đã đặt", "Đang sử dụng", "Đang dọn"
    tang: number;
    loaiPhong?: LoaiPhongDTO; // Thông tin chi tiết loại phòng (sẽ cần nếu API backend trả về)
} 