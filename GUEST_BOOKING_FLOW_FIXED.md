# 🏨 Guest Booking Flow - Fixed (Updated)

## 🔄 Flow mới (theo yêu cầu)

### 1. Trang `/guest-booking`
- Khách điền thông tin đặt phòng
- Chọn phương thức thanh toán trong modal
- Nhấn "Xác nhận đặt phòng"
- **Lưu data vào localStorage**
- **Chuyển đến**: `/guest-booking/payment-confirmation`

### 2. Trang `/guest-booking/payment-confirmation` (MỚI)
- Hiển thị tóm tắt toàn bộ thông tin đặt phòng
- Hiển thị chi tiết thanh toán đã chọn
- Điều khoản và điều kiện
- Nhấn "Xác nhận và tiếp tục"
- **Gọi API**: `POST /DatPhong/GuestPending`
- **Kết quả**: Nhận `bookingId` và `maXacNhan`
- **Chuyển đến**: `/guest-booking/confirm`

### 3. Trang `/guest-booking/confirm`
- Hiển thị form nhập OTP 6 số
- Khách nhập mã OTP từ email
- Nhấn "Xác nhận đặt phòng"
- **Gọi API**: `POST /DatPhong/GuestConfirm`
- **Kết quả**: Tạo đặt phòng chính thức
- **Chuyển đến**: `/guest-booking/success`

### 4. Trang `/guest-booking/success`
- Hiển thị thông tin đặt phòng thành công
- Gợi ý tạo tài khoản
- Các nút hành động

## 🔧 Thay đổi đã thực hiện

### Frontend
1. **`/guest-booking/page.tsx`**:
   - Bỏ API call, chỉ lưu data vào localStorage
   - Chuyển hướng đến `/guest-booking/payment-confirmation`

2. **`/guest-booking/payment-confirmation/page.tsx`** (MỚI):
   - Hiển thị tóm tắt toàn bộ thông tin đặt phòng
   - Gọi API `/DatPhong/GuestPending` khi xác nhận
   - Chuyển hướng đến `/guest-booking/confirm` sau khi thành công

### Backend
2. **`PendingGuestBooking.cs`**:
   - Thêm các trường: `PhuongThucThanhToan`, `LoaiThe`, `GhiChuThanhToan`, `TongTien`
   - Thêm trường `IsGuestBooking` để đánh dấu

## 📋 API Endpoints

### 1. Tạo booking tạm thời
```
POST /api/DatPhong/GuestPending
Content-Type: multipart/form-data

Body:
- HoTen: string
- Email: string  
- SoDienThoai: string
- MaPhong: string
- NgayNhanPhong: string
- NgayTraPhong: string
- SoNguoiLon: int
- SoTreEm: int
- PhuongThucThanhToan: string
- TongTien: decimal
- GhiChu: string (optional)
- ThoiGianDen: string (optional)

Response:
{
  "bookingId": "guid",
  "maXacNhan": "123456",
  "message": "Đặt phòng tạm thời thành công..."
}
```

### 2. Xác nhận OTP
```
POST /api/DatPhong/GuestConfirm
Content-Type: multipart/form-data

Body:
- bookingId: string
- maXacNhan: string

Response:
{
  "message": "Xác nhận thành công, đã đặt phòng!",
  "datPhong": { ... }
}
```

## 🧪 Test Flow

1. **Truy cập**: `/guest-booking`
2. **Điền thông tin** đặt phòng và thanh toán
3. **Nhấn "Xác nhận"** → Chuyển đến `/guest-booking/confirm`
4. **Kiểm tra email** để lấy mã OTP 6 số
5. **Nhập OTP** và nhấn "Xác nhận đặt phòng"
6. **Thành công** → Chuyển đến `/guest-booking/success`

## 🔑 Admin Test Account

- **Username**: `admin`
- **Password**: `admin123`

## 📧 Email Configuration

Email OTP sẽ được gửi qua Gmail SMTP:
- **Host**: smtp.gmail.com
- **Port**: 587
- **Username**: occhoe8104@gmail.com

## 🚀 Deploy Status

- **Frontend**: https://passion-quan-li-khach-san.vercel.app
- **Backend**: https://passion-quan-li-khach-san.onrender.com
- **API Docs**: https://passion-quan-li-khach-san.onrender.com/swagger
