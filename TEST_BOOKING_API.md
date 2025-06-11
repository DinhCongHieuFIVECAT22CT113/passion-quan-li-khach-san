# 🧪 TEST BOOKING API

## 📋 Danh sách API cần test

### 1. **API đặt phòng khách vãng lai** - `/DatPhong/Guest`

**Method**: POST  
**Auth**: Không cần  
**Content-Type**: multipart/form-data

**Payload**:
```
hoTen: "Nguyễn Văn A"
email: "test@example.com"
soDienThoai: "0123456789"
maPhong: "P001"
ngayNhanPhong: "2024-12-25"
ngayTraPhong: "2024-12-27"
soNguoiLon: 2
soTreEm: 0
ghiChu: "Test booking"
thoiGianDen: "14:00"
```

**Expected Response**:
```json
{
  "message": "Đặt phòng thành công.",
  "datPhong": "DP001"
}
```

### 2. **API đặt phòng user đã đăng nhập** - `/DatPhong`

**Method**: POST  
**Auth**: Bearer Token  
**Content-Type**: multipart/form-data

**Payload**:
```
maKH: "KH001"
maPhong: "P001"
ngayNhanPhong: "2024-12-25"
ngayTraPhong: "2024-12-27"
treEm: 0
nguoiLon: 2
ghiChu: "Test booking"
soLuongPhong: 1
thoiGianDen: "14:00"
```

### 3. **API lấy danh sách đặt phòng** - `/DatPhong/KhachHang`

**Method**: GET  
**Auth**: Bearer Token

**Expected Response**:
```json
[
  {
    "maDatPhong": "DP001",
    "maKh": "KH001",
    "treEm": 0,
    "nguoiLon": 2,
    "ghiChu": "Test booking",
    "soLuongPhong": 1,
    "thoiGianDen": "14:00",
    "ngayNhanPhong": "2024-12-25T00:00:00",
    "ngayTraPhong": "2024-12-27T00:00:00",
    "trangThai": "Chưa xác nhận",
    "ngayTao": "2024-12-20T10:00:00",
    "ngaySua": "2024-12-20T10:00:00"
  }
]
```

## 🔧 Cách test

### Test với Postman/Thunder Client:

1. **Test API Guest Booking**:
   ```
   POST http://localhost:5000/api/DatPhong/Guest
   Content-Type: multipart/form-data
   
   Body (form-data):
   - hoTen: Nguyễn Văn A
   - email: test@example.com
   - soDienThoai: 0123456789
   - maPhong: P001
   - ngayNhanPhong: 2024-12-25
   - ngayTraPhong: 2024-12-27
   - soNguoiLon: 2
   - soTreEm: 0
   - ghiChu: Test booking
   - thoiGianDen: 14:00
   ```

2. **Test API User Booking** (cần login trước):
   ```
   POST http://localhost:5000/api/DatPhong
   Authorization: Bearer YOUR_JWT_TOKEN
   Content-Type: multipart/form-data
   
   Body (form-data):
   - maKH: KH001
   - maPhong: P001
   - ngayNhanPhong: 2024-12-25
   - ngayTraPhong: 2024-12-27
   - treEm: 0
   - nguoiLon: 2
   - ghiChu: Test booking
   - soLuongPhong: 1
   - thoiGianDen: 14:00
   ```

### Test với Frontend:

1. **Test Guest Booking**:
   - Vào trang room detail
   - Chọn "Đặt phòng khách"
   - Điền thông tin và submit
   - Kiểm tra có chuyển đến trang success không

2. **Test User Booking**:
   - Đăng nhập trước
   - Vào trang room detail
   - Chọn "Đặt với tài khoản"
   - Điền thông tin và submit
   - Kiểm tra có chuyển đến trang bookings không

## 🐛 Các lỗi có thể gặp

1. **400 Bad Request**: Thiếu field bắt buộc hoặc format sai
2. **404 Not Found**: Mã phòng không tồn tại
3. **500 Internal Server Error**: Lỗi database hoặc logic

## ✅ Checklist test

- [ ] API `/DatPhong/Guest` hoạt động
- [ ] API `/DatPhong` hoạt động  
- [ ] API `/DatPhong/KhachHang` hoạt động
- [ ] Frontend guest booking flow hoạt động
- [ ] Frontend user booking flow hoạt động
- [ ] Database lưu đúng thông tin
- [ ] Email notification (nếu có)
- [ ] Error handling đúng
