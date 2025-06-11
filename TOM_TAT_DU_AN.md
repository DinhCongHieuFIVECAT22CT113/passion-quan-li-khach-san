# TÓM TẮT TỔNG HỢP DỰ ÁN QUẢN LÝ KHÁCH SẠN

## 1. TỔNG QUAN DỰ ÁN

Dự án "Quản lý Khách sạn" là một hệ thống toàn diện được phát triển với kiến trúc client-server hiện đại, bao gồm:

- **Frontend**: Xây dựng bằng Next.js (React 19.x) với TypeScript
- **Backend**: Xây dựng bằng ASP.NET Core 8.0 (C#)
- **Database**: Microsoft SQL Server (Cloud)
- **Storage**: Supabase Storage (đã migrate từ local storage)
- **Realtime Communication**: SignalR
- **Deployment**: Vercel (Frontend) và Render (Backend)

Hệ thống cung cấp đầy đủ các chức năng quản lý khách sạn từ đặt phòng, quản lý phòng, dịch vụ, khuyến mãi, nhân viên, khách hàng, đến thanh toán và báo cáo. Dự án được thiết kế với trọng tâm là trải nghiệm người dùng, hiệu suất cao và khả năng mở rộng.

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Frontend (Next.js)

- **Công nghệ chính**:
  - Next.js 15.x (React 19.x)
  - TypeScript 5.8.x
  - TailwindCSS 4.x
  - React Icons, Chart.js 4.x
  - i18next (đa ngôn ngữ)
  - JWT Authentication
  - SignalR Client (@microsoft/signalr 8.0.x)

- **Cấu trúc thư mục**:
  - `/src/app`: Các trang và components (App Router)
  - `/src/lib`: Thư viện, API calls, helpers
  - `/src/types`: TypeScript interfaces
  - `/public`: Static assets
  - `/src/app/components`: Reusable UI components
  - `/src/app/users`: Các trang dành cho khách hàng
  - `/src/app/admin`: Các trang dành cho admin
  - `/src/app/employe`: Các trang dành cho nhân viên

- **Tính năng nổi bật**:
  - Enhanced Search Bar với Autocomplete và lịch sử tìm kiếm
  - Testimonials Section với carousel tự động
  - Skeleton Loading Components cho UX mượt mà
  - Real-time Availability Checker cập nhật mỗi 30 giây
  - Improved Booking Flow với modal thông minh
  - Responsive Design cho mọi thiết bị
  - Internationalization (i18n) hỗ trợ đa ngôn ngữ
  - Authentication với JWT và Refresh Token
  - Dynamic routing với Next.js App Router

### 2.2. Backend (ASP.NET Core)

- **Công nghệ chính**:
  - ASP.NET Core 8.0
  - Entity Framework Core 8.0.x
  - JWT Authentication với Refresh Tokens
  - SignalR (realtime notifications)
  - Swagger API Documentation
  - Supabase Storage Integration
  - CORS configuration cho multiple origins
  - Role-based Authorization

- **Cấu trúc thư mục**:
  - `/Controllers`: API endpoints (RESTful)
  - `/Models`: Entity models và database context
  - `/DTOs`: Data Transfer Objects cho API
  - `/Services`: Business logic và services
  - `/Data`: Database context và repositories
  - `/Hubs`: SignalR hubs cho realtime
  - `/Authorization`: Custom authorization handlers
  - `/Configuration`: App configuration classes
  - `/Helpers`: Utility classes
  - `/Migrations`: EF Core migrations

- **Tính năng nổi bật**:
  - RESTful API với versioning
  - Role-based Authorization với custom policies
  - JWT Authentication với Refresh Tokens và token rotation
  - Email Notifications với Gmail API
  - File Upload/Storage với Supabase
  - Realtime Notifications với SignalR
  - Caching với Memory Cache
  - Swagger UI với JWT authentication
  - Repository pattern cho data access
  - Dependency Injection

## 3. CƠ SỞ DỮ LIỆU

### 3.1. Mô hình dữ liệu

Hệ thống sử dụng Microsoft SQL Server với Entity Framework Core làm ORM. Database được thiết kế với các mối quan hệ rõ ràng và được tối ưu hóa cho hiệu suất.

### 3.2. Các bảng chính

- **Phòng & Loại Phòng**:
  - `Phongs`: Thông tin chi tiết từng phòng (mã phòng, trạng thái, hình ảnh)
  - `LoaiPhongs`: Các loại phòng và đặc điểm (giá, sức chứa, diện tích, tiện nghi)
  - `TienNghis`: Các tiện nghi của phòng (WiFi, TV, điều hòa, minibar)

- **Đặt phòng & Thanh toán**:
  - `DatPhongs`: Thông tin đặt phòng (mã đặt phòng, ngày đặt, trạng thái)
  - `ChiTietDatPhongs`: Chi tiết đặt phòng (phòng, check-in, check-out)
  - `HoaDons`: Hóa đơn thanh toán (mã hóa đơn, tổng tiền, trạng thái)
  - `ChiTietHoaDons`: Chi tiết các khoản trong hóa đơn
  - `PhuongThucThanhToans`: Phương thức thanh toán (tiền mặt, thẻ, chuyển khoản)

- **Dịch vụ & Khuyến mãi**:
  - `DichVus`: Các dịch vụ khách sạn (spa, nhà hàng, giặt ủi)
  - `KhuyenMais`: Chương trình khuyến mãi (mã, tên, thời gian, phần trăm giảm)
  - `ApDungKMs`: Áp dụng khuyến mãi cho đặt phòng
  - `SuDungDichVus`: Lịch sử sử dụng dịch vụ của khách

- **Người dùng**:
  - `KhachHangs`: Thông tin khách hàng (mã, tên, email, số điện thoại)
  - `NhanViens`: Thông tin nhân viên (mã, tên, chức vụ, lương)
  - `LoaiKhachHangs`: Phân loại khách hàng (thường, VIP, thành viên)
  - `Reviews`: Đánh giá từ khách hàng (rating, nội dung, ngày đánh giá)
  - `RefreshTokens`: Lưu trữ refresh tokens cho authentication

- **Quản lý nhân sự**:
  - `CaLamViecs`: Ca làm việc (sáng, chiều, tối)
  - `PhanCongCas`: Phân công ca làm việc cho nhân viên
  - `ChucVus`: Các chức vụ trong khách sạn

### 3.3. Quan hệ dữ liệu

- Mỗi `Phong` thuộc về một `LoaiPhong`
- Mỗi `DatPhong` có nhiều `ChiTietDatPhong`
- Mỗi `HoaDon` liên kết với một `DatPhong`
- Mỗi `KhachHang` có thể có nhiều `DatPhong`
- Mỗi `NhanVien` có thể có nhiều `PhanCongCa`
- Mỗi `DatPhong` có thể áp dụng nhiều `KhuyenMai` thông qua `ApDungKM`

### 3.4. Migrations và Seeding

- Sử dụng Entity Framework Core Migrations để quản lý schema
- Seed data cho các bảng cơ bản (LoaiPhong, DichVu, ChucVu)
- Script SQL để tạo tài khoản admin ban đầu

## 4. TÍNH NĂNG CHI TIẾT

### 4.1. Đối với Khách hàng

- **Tìm kiếm & Đặt phòng**:
  - Tìm kiếm phòng theo nhiều tiêu chí (ngày, số người, loại phòng, giá)
  - Lọc phòng theo tiện nghi, giá, đánh giá
  - Xem chi tiết phòng với hình ảnh, tiện nghi, đánh giá
  - Đặt phòng trực tuyến với lựa chọn dịch vụ bổ sung
  - Thanh toán trực tuyến hoặc tại khách sạn
  - Nhận email xác nhận đặt phòng

- **Quản lý tài khoản**:
  - Đăng ký, đăng nhập với email hoặc mạng xã hội
  - Xem và quản lý lịch sử đặt phòng
  - Hủy hoặc sửa đổi đặt phòng
  - Quản lý thông tin cá nhân và thanh toán
  - Đánh giá dịch vụ sau khi sử dụng
  - Theo dõi điểm thưởng và ưu đãi thành viên

- **Dịch vụ & Khuyến mãi**:
  - Xem và đặt dịch vụ bổ sung (spa, nhà hàng)
  - Áp dụng mã khuyến mãi khi đặt phòng
  - Nhận thông báo về ưu đãi mới qua email
  - Tham gia chương trình khách hàng thân thiết
  - Xem gợi ý dịch vụ dựa trên lịch sử

- **Trải nghiệm người dùng**:
  - Giao diện thân thiện, responsive trên mọi thiết bị
  - Thông báo realtime về trạng thái đặt phòng
  - Hỗ trợ đa ngôn ngữ (Việt, Anh)
  - Dark mode và light mode
  - Tối ưu hóa tốc độ tải trang

### 4.2. Đối với Nhân viên & Quản lý

- **Quản lý phòng**:
  - Thêm, sửa, xóa phòng và loại phòng
  - Cập nhật trạng thái phòng (trống, đã đặt, đang dọn)
  - Quản lý hình ảnh phòng với Supabase Storage
  - Quản lý giá phòng theo mùa và sự kiện
  - Thiết lập các tiện nghi cho từng loại phòng

- **Quản lý đặt phòng**:
  - Dashboard hiển thị tổng quan đặt phòng
  - Xem và xử lý yêu cầu đặt phòng mới
  - Check-in, check-out với QR code
  - Xử lý thanh toán và hoàn tiền
  - Quản lý thay đổi và hủy đặt phòng
  - Gửi thông báo tự động cho khách

- **Quản lý dịch vụ & khuyến mãi**:
  - Thêm, sửa, xóa dịch vụ với hình ảnh
  - Tạo và quản lý chương trình khuyến mãi
  - Thiết lập giá dịch vụ và khuyến mãi theo mùa
  - Theo dõi sử dụng dịch vụ và doanh thu
  - Phân tích hiệu quả của các chương trình khuyến mãi

- **Quản lý nhân sự**:
  - Thêm, sửa, xóa thông tin nhân viên
  - Phân công ca làm việc với lịch trực quan
  - Quản lý chấm công và tính lương
  - Phân quyền theo vai trò (Admin, Manager, Staff)
  - Theo dõi hiệu suất nhân viên

- **Báo cáo & Thống kê**:
  - Dashboard với biểu đồ trực quan
  - Báo cáo doanh thu theo ngày, tuần, tháng, năm
  - Thống kê tỷ lệ lấp đầy phòng và ADR (Average Daily Rate)
  - Phân tích xu hướng đặt phòng và mùa cao điểm
  - Báo cáo khách hàng (mới, quay lại, hủy)
  - Export báo cáo dưới dạng PDF, Excel

- **Quản lý hệ thống**:
  - Cấu hình thông tin khách sạn
  - Quản lý người dùng và phân quyền
  - Sao lưu và khôi phục dữ liệu
  - Theo dõi logs hệ thống
  - Cấu hình email và thông báo

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
  - Thêm hiển thị chi tiết phòng (hình ảnh, tên, loại, diện tích, sức chứa, giá)
  - Sửa logic chuyển hướng cho khách vãng lai (lưu dữ liệu vào localStorage)
  - Xử lý thống nhất cho cả 2 loại khách
  - Thêm CSS cho responsive design
  - Nút đặt phòng nổi bật với màu xanh lá

- **Loại bỏ trang trùng lặp**:
  - Không còn sử dụng `/users/room-detail/[maPhong]`
  - Từ `/rooms/[slug]` trực tiếp mở modal đặt phòng
  - Nút "Xem chi tiết phòng" → "Đặt phòng ngay"

- **Lợi ích**:
  - Giảm từ 4 bước xuống 3 bước
  - Thống nhất luồng cho cả 2 loại khách
  - Thông tin phòng hiển thị đầy đủ trong modal
  - UX tốt hơn, không cần chuyển trang nhiều lần

### 5.2. Migration từ Local Storage sang Supabase Storage

- **Lợi ích**:
  - Khả năng mở rộng tốt hơn với dung lượng không giới hạn
  - Backup tự động và versioning
  - CDN global giúp tải hình ảnh nhanh hơn
  - Bảo mật cao hơn với policies
  - Không lo về dung lượng server
  - Dễ dàng quản lý qua Supabase Dashboard

- **Thay đổi chính**:
  - Thêm Supabase package và cấu hình trong backend
  - Tạo SupabaseStorageService để quản lý file upload/delete
  - Cập nhật WriteFileRepository để sử dụng Supabase
  - Cập nhật DTOs để hỗ trợ cả file upload và URL
  - Cập nhật Repository (DichVu, KhuyenMai) để xử lý file upload
  - Tạo Migration Service để migrate hình ảnh cũ
  - Tạo Migration Controller để chạy migration
  - Cập nhật frontend để hiển thị hình ảnh từ Supabase

- **Cấu trúc lưu trữ**:
  - Bucket `hotel-images` với các thư mục:
    - `services/`: Hình ảnh dịch vụ
    - `promotions/`: Hình ảnh khuyến mãi
    - `rooms/`: Hình ảnh phòng
    - `users/`: Avatar người dùng

### 5.3. Cải tiến UI/UX trang Home

- **Tính năng mới**:
  - Enhanced Search Bar với Autocomplete và lịch sử tìm kiếm
  - Testimonials Section với carousel tự động và navigation controls
  - Skeleton Loading Components thay thế spinner
  - Real-time Availability Checker cập nhật mỗi 30 giây
  - Improved Booking Flow với step indicators động

- **Performance Optimizations**:
  - Skeleton loading thay thế loading spinners
  - Image lazy loading với intersection observer
  - Component code splitting tự động
  - Resource preloading cho critical assets
  - Smart caching cho API responses
  - Debounced search để giảm API calls

- **UI/UX Improvements**:
  - Consistent design system với color palette
  - Smooth animations và transitions
  - Micro-interactions để tăng engagement
  - Accessibility improvements (ARIA labels, keyboard navigation)
  - Touch-optimized controls cho mobile
  - Responsive typography

### 5.4. Triển khai lên Cloud

- **Frontend (Vercel)**:
  - Cấu hình biến môi trường cho API URL
  - Tối ưu hóa build và deployment
  - Cấu hình headers bảo mật
  - Automatic preview deployments cho mỗi PR
  - Analytics và monitoring

- **Backend (Render)**:
  - Containerization với Docker
  - Cấu hình CORS cho multiple origins
  - Environment variables cho thông tin nhạy cảm
  - Automatic scaling
  - Logs và monitoring

- **Lợi ích**:
  - Khả năng truy cập từ mọi nơi
  - Automatic scaling theo nhu cầu
  - Bảo mật cao hơn
  - CI/CD pipeline tự động
  - Giảm chi phí vận hành

## 6. CÔNG NGHỆ & THƯ VIỆN CHI TIẾT

### 6.1. Frontend

- **Core**:
  - Next.js 15.x: Framework React với SSR và App Router
  - React 19.x: UI library
  - TypeScript 5.8.x: Type safety và developer experience

- **Styling**:
  - TailwindCSS 4.x: Utility-first CSS framework
  - CSS Modules: Scoped styling
  - PostCSS: CSS processing

- **State Management**:
  - React Context: Global state
  - useState/useReducer: Component state
  - Custom hooks: Reusable logic

- **UI Components**:
  - React Icons: Icon library
  - Chart.js & React-Chartjs-2: Data visualization
  - React-Datepicker: Date selection
  - React-Toastify: Toast notifications
  - Custom components: Modal, Dropdown, Tabs

- **Internationalization**:
  - i18next: Translation framework
  - i18next-browser-languagedetector: Language detection

- **Authentication**:
  - JWT: Token-based auth
  - js-cookie: Cookie management
  - jwt-decode: Token decoding

- **Networking**:
  - Fetch API: Data fetching
  - Custom API client: Centralized API calls
  - AbortController: Request cancellation

- **Realtime**:
  - SignalR client (@microsoft/signalr): Realtime communication

- **Performance**:
  - Intersection Observer: Lazy loading
  - useCallback/useMemo: Memoization
  - Dynamic imports: Code splitting

### 6.2. Backend

- **Core**:
  - ASP.NET Core 8.0: Web framework
  - C# 12: Programming language
  - .NET 8.0 SDK: Runtime

- **API**:
  - ASP.NET Core MVC: Controller-based API
  - Swagger/OpenAPI: API documentation
  - CORS: Cross-origin resource sharing

- **ORM**:
  - Entity Framework Core 8.0.x: Object-relational mapping
  - LINQ: Query language
  - SQL Server provider: Database connectivity

- **Authentication & Authorization**:
  - JWT Bearer: Token authentication
  - System.IdentityModel.Tokens.Jwt: JWT handling
  - Custom authorization policies: Role-based access
  - Refresh token rotation: Security enhancement

- **Storage**:
  - Supabase: Cloud storage
  - Supabase.Client: .NET client for Supabase

- **Email**:
  - Google.Apis.Gmail.v1: Email sending
  - HTML templates: Email formatting

- **Realtime**:
  - SignalR: Realtime communication
  - Notification Hub: Centralized notification system

- **Serialization**:
  - Newtonsoft.Json: JSON handling
  - System.Text.Json: Modern JSON serialization

- **Dependency Injection**:
  - Built-in DI container: Service registration
  - Scoped/Singleton/Transient services: Lifetime management

- **Logging & Monitoring**:
  - Microsoft.Extensions.Logging: Logging framework
  - Console and file logging: Log storage

## 7. TRIỂN KHAI & HOSTING

### 7.1. Môi trường triển khai

- **Development**:
  - Local development với Docker
  - Visual Studio/VS Code
  - SQL Server local/Docker
  - Supabase local emulator

- **Staging**:
  - Vercel Preview Deployments
  - Render Development Environment
  - Test database

- **Production**:
  - Vercel (Frontend)
  - Render (Backend)
  - SQL Server Cloud
  - Supabase Production

### 7.2. CI/CD Pipeline

- **Frontend**:
  - GitHub integration với Vercel
  - Automatic deployments on push
  - Preview deployments for PRs
  - Environment variables per deployment

- **Backend**:
  - GitHub integration với Render
  - Docker build và deployment
  - Automatic scaling
  - Health checks

### 7.3. Monitoring & Analytics

- **Frontend**:
  - Vercel Analytics
  - Error tracking
  - Performance monitoring
  - User behavior analytics

- **Backend**:
  - Render Logs
  - Custom logging
  - Performance metrics
  - Error alerting

### 7.4. Bảo mật

- **Authentication**:
  - JWT với expiration
  - Refresh token rotation
  - HTTPS everywhere
  - Secure cookies

- **Authorization**:
  - Role-based access control
  - Resource-based permissions
  - API rate limiting

- **Data Protection**:
  - Password hashing
  - Data encryption
  - SQL injection prevention
  - XSS protection

## 8. ROADMAP & PHÁT TRIỂN TƯƠNG LAI

### 8.1. Tính năng đang phát triển

- **Payment Gateway Integration**:
  - VNPay, Momo, Stripe integration
  - Automatic invoicing
  - Subscription management

- **Advanced Analytics**:
  - Business intelligence dashboard
  - Predictive analytics for pricing
  - Customer segmentation

- **Mobile App**:
  - React Native application
  - Push notifications
  - Offline support

- **AI Features**:
  - Chatbot for customer support
  - Personalized recommendations
  - Automated room assignment

### 8.2. Cải tiến kỹ thuật

- **Performance**:
  - Server-side rendering optimization
  - Database query optimization
  - Image optimization pipeline

- **Scalability**:
  - Microservices architecture
  - Horizontal scaling
  - Caching strategy

- **Developer Experience**:
  - Improved documentation
  - Component library
  - End-to-end testing

### 8.3. Mục tiêu dài hạn

- **Multi-property Support**:
  - Quản lý nhiều khách sạn/cơ sở
  - Centralized management
  - Property-specific settings

- **Marketplace**:
  - Third-party integrations
  - Plugin system
  - API for partners

- **Global Expansion**:
  - Multi-language support
  - Multi-currency
  - Regional compliance

## 9. KẾT LUẬN

Dự án "Quản lý Khách sạn" là một hệ thống toàn diện với đầy đủ tính năng cần thiết cho việc vận hành một khách sạn hiện đại. Hệ thống được xây dựng với kiến trúc phân tách rõ ràng giữa frontend và backend, sử dụng các công nghệ hiện đại nhất, và được thiết kế với trọng tâm là trải nghiệm người dùng và hiệu suất.

Các cải tiến gần đây như migration sang Supabase Storage, cải thiện luồng đặt phòng, nâng cấp UI/UX và triển khai lên cloud đã giúp hệ thống trở nên mạnh mẽ, dễ mở rộng và thân thiện với người dùng hơn.

Với nền tảng vững chắc và roadmap rõ ràng, dự án có tiềm năng phát triển thành một giải pháp quản lý khách sạn toàn diện, đáp ứng nhu cầu của cả khách sạn nhỏ và chuỗi khách sạn lớn.

---

*Tài liệu này cung cấp tổng quan chi tiết về dự án Quản lý Khách sạn. Để biết thêm chi tiết về từng phần cụ thể, vui lòng tham khảo tài liệu kỹ thuật hoặc mã nguồn tương ứng.*