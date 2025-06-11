# TÓM TẮT TỔNG HỢP DỰ ÁN QUẢN LÝ KHÁCH SẠN

## 1. TỔNG QUAN DỰ ÁN

Dự án "Quản lý Khách sạn" là một hệ thống toàn diện được phát triển với kiến trúc client-server hiện đại, bao gồm:

- **Frontend**: Xây dựng bằng Next.js (React) với TypeScript
- **Backend**: Xây dựng bằng ASP.NET Core 8.0 (C#)
- **Database**: Microsoft SQL Server
- **Storage**: Supabase Storage (đã migrate từ local storage)
- **Realtime Communication**: SignalR

Hệ thống cung cấp đầy đủ các chức năng quản lý khách sạn từ đặt phòng, quản lý phòng, dịch vụ, khuyến mãi, nhân viên, khách hàng, đến thanh toán và báo cáo.

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Frontend (Next.js)

- **Công nghệ chính**:
  - Next.js 15.x (React 19.x)
  - TypeScript
  - TailwindCSS
  - React Icons, Chart.js
  - i18next (đa ngôn ngữ)
  - JWT Authentication

- **Cấu trúc thư mục**:
  - `/src/app`: Các trang và components
  - `/src/lib`: Thư viện, API calls, helpers
  - `/src/types`: TypeScript interfaces
  - `/public`: Static assets

- **Tính năng nổi bật**:
  - Enhanced Search Bar với Autocomplete
  - Testimonials Section
  - Skeleton Loading Components
  - Real-time Availability Checker
  - Improved Booking Flow
  - Responsive Design

### 2.2. Backend (ASP.NET Core)

- **Công nghệ chính**:
  - ASP.NET Core 8.0
  - Entity Framework Core
  - JWT Authentication
  - SignalR (realtime)
  - Swagger API Documentation
  - Supabase Storage Integration

- **Cấu trúc thư mục**:
  - `/Controllers`: API endpoints
  - `/Models`: Entity models
  - `/DTOs`: Data Transfer Objects
  - `/Services`: Business logic
  - `/Data`: Database context và repositories
  - `/Hubs`: SignalR hubs

- **Tính năng nổi bật**:
  - RESTful API
  - Role-based Authorization
  - JWT Authentication với Refresh Tokens
  - Email Notifications
  - File Upload/Storage với Supabase
  - Realtime Notifications

## 3. CƠ SỞ DỮ LIỆU

### 3.1. Các bảng chính

- **Phòng & Loại Phòng**:
  - `Phongs`: Thông tin chi tiết từng phòng
  - `LoaiPhongs`: Các loại phòng và đặc điểm

- **Đặt phòng & Thanh toán**:
  - `DatPhongs`: Thông tin đặt phòng
  - `ChiTietDatPhongs`: Chi tiết đặt phòng
  - `HoaDons`: Hóa đơn thanh toán
  - `PhuongThucThanhToans`: Phương thức thanh toán

- **Dịch vụ & Khuyến mãi**:
  - `DichVus`: Các dịch vụ khách sạn
  - `KhuyenMais`: Chương trình khuyến mãi
  - `ApDungKMs`: Áp dụng khuyến mãi
  - `SuDungDichVus`: Sử dụng dịch vụ

- **Người dùng**:
  - `KhachHangs`: Thông tin khách hàng
  - `NhanViens`: Thông tin nhân viên
  - `LoaiKhachHangs`: Phân loại khách hàng
  - `Reviews`: Đánh giá từ khách hàng

- **Quản lý nhân sự**:
  - `CaLamViecs`: Ca làm việc
  - `PhanCongCas`: Phân công ca làm việc

## 4. TÍNH NĂNG CHÍNH

### 4.1. Đối với Khách hàng

- **Tìm kiếm & Đặt phòng**:
  - Tìm kiếm phòng theo nhiều tiêu chí
  - Xem chi tiết phòng với hình ảnh, tiện nghi
  - Đặt phòng trực tuyến (cả khách đã đăng nhập và khách vãng lai)
  - Thanh toán trực tuyến

- **Quản lý tài khoản**:
  - Đăng ký, đăng nhập
  - Xem lịch sử đặt phòng
  - Quản lý thông tin cá nhân
  - Đánh giá dịch vụ

- **Dịch vụ & Khuyến mãi**:
  - Xem và đặt dịch vụ
  - Áp dụng mã khuyến mãi
  - Nhận thông báo về ưu đãi mới

### 4.2. Đối với Nhân viên & Quản lý

- **Quản lý phòng**:
  - Thêm, sửa, xóa phòng
  - Cập nhật trạng thái phòng
  - Quản lý loại phòng và giá

- **Quản lý đặt phòng**:
  - Xem và xử lý yêu cầu đặt phòng
  - Check-in, check-out
  - Xử lý thanh toán

- **Quản lý dịch vụ & khuyến mãi**:
  - Thêm, sửa, xóa dịch vụ
  - Tạo và quản lý chương trình khuyến mãi
  - Theo dõi sử dụng dịch vụ

- **Quản lý nhân sự**:
  - Phân công ca làm việc
  - Quản lý thông tin nhân viên
  - Phân quyền theo vai trò

- **Báo cáo & Thống kê**:
  - Doanh thu theo thời gian
  - Tỷ lệ lấp đầy phòng
  - Thống kê khách hàng

## 5. CẢI TIẾN GẦN ĐÂY

### 5.1. Cải tiến luồng đặt phòng

- **Luồng mới thống nhất**:
  ```
  /users/rooms (Danh sách loại phòng)
      ↓
  /rooms/[slug] (Chi tiết các phòng trong loại)
      ↓
  BookingModal (Đặt phòng với đầy đủ thông tin)
      ↓
  - User đã đăng nhập: Xử lý trực tiếp trong modal
  - Khách vãng lai: Chuyển đến /guest-booking để thanh toán
  ```

- **Cải tiến BookingModal**:
  - Thêm hiển thị chi tiết phòng
  - Sửa logic chuyển hướng cho khách vãng lai
  - Xử lý thống nhất cho cả 2 loại khách

### 5.2. Migration từ Local Storage sang Supabase Storage

- **Lợi ích**:
  - Khả năng mở rộng tốt hơn
  - Backup tự động
  - CDN global
  - Bảo mật cao hơn
  - Không lo về dung lượng server

- **Thay đổi chính**:
  - Thêm Supabase package và cấu hình
  - Tạo SupabaseStorageService để quản lý file
  - Cập nhật Repository để xử lý file upload
  - Tạo Migration Service để migrate hình ảnh cũ

### 5.3. Cải tiến UI/UX trang Home

- **Tính năng mới**:
  - Enhanced Search Bar với Autocomplete
  - Testimonials Section
  - Skeleton Loading Components
  - Real-time Availability Checker
  - Improved Booking Flow

- **Performance Optimizations**:
  - Skeleton loading thay thế loading spinners
  - Image lazy loading với intersection observer
  - Component code splitting tự động
  - Resource preloading cho critical assets

## 6. CÔNG NGHỆ & THƯ VIỆN

### 6.1. Frontend

- **Core**: Next.js, React, TypeScript
- **Styling**: TailwindCSS, CSS Modules
- **State Management**: React Context, Local State
- **UI Components**: React Icons, Chart.js, React-Datepicker
- **Internationalization**: i18next
- **Authentication**: JWT, js-cookie
- **Networking**: Fetch API
- **Notifications**: React-Toastify
- **Realtime**: SignalR client (@microsoft/signalr)

### 6.2. Backend

- **Core**: ASP.NET Core 8.0, C#
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer, System.IdentityModel.Tokens.Jwt
- **API Documentation**: Swagger/OpenAPI
- **Storage**: Supabase
- **Email**: Google.Apis.Gmail.v1
- **Realtime**: SignalR
- **Serialization**: Newtonsoft.Json

## 7. HƯỚNG DẪN TRIỂN KHAI

### 7.1. Yêu cầu hệ thống

- **Frontend**:
  - Node.js 18+ và npm/yarn
  - Trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)

- **Backend**:
  - .NET 8.0 SDK
  - Microsoft SQL Server
  - Tài khoản Supabase (cho storage)

### 7.2. Cài đặt & Chạy

- **Frontend**:
  ```bash
  cd frontend/fe-quanlikhachsan
  npm install
  npm run dev
  ```
  Truy cập: http://localhost:3000

- **Backend**:
  ```bash
  cd backend/be-quanlikhachsanapi
  dotnet run
  ```
  API sẽ chạy tại: http://localhost:5000
  Swagger UI: http://localhost:5000/swagger

### 7.3. Cấu hình

- **Frontend**: Cấu hình trong `/frontend/fe-quanlikhachsan/src/lib/config.js`
- **Backend**: Cấu hình trong `/backend/be-quanlikhachsanapi/appsettings.json`

## 8. KẾT LUẬN

Dự án "Quản lý Khách sạn" là một hệ thống toàn diện với đầy đủ tính năng cần thiết cho việc vận hành một khách sạn hiện đại. Hệ thống được xây dựng với kiến trúc phân tách rõ ràng giữa frontend và backend, sử dụng các công nghệ hiện đại nhất, và được thiết kế với trọng tâm là trải nghiệm người dùng và hiệu suất.

Các cải tiến gần đây như migration sang Supabase Storage, cải thiện luồng đặt phòng, và nâng cấp UI/UX đã giúp hệ thống trở nên mạnh mẽ, dễ mở rộng và thân thiện với người dùng hơn.

---

*Tài liệu này cung cấp tổng quan về dự án Quản lý Khách sạn. Để biết thêm chi tiết về từng phần cụ thể, vui lòng tham khảo tài liệu kỹ thuật hoặc mã nguồn tương ứng.*