# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN QUẢN LÝ KHÁCH SẠN

## 1. Tổng quan

Hướng dẫn này mô tả các bước để triển khai dự án Quản lý Khách sạn lên các nền tảng cloud:
- **Frontend**: Triển khai lên Vercel
- **Backend**: Triển khai lên Render
- **Database**: Đã kết nối với SQL Server cloud
- **Storage**: Đã kết nối với Supabase

## 2. Triển khai Frontend (Vercel)

### 2.1. Chuẩn bị code

1. **Cập nhật cấu hình API URL**:
   - File `src/lib/config.ts` đã được cập nhật để sử dụng biến môi trường `NEXT_PUBLIC_API_URL`
   - File `.env.production` đã được tạo với URL backend

2. **Cấu hình Vercel**:
   - File `vercel.json` đã được tạo với các cấu hình cần thiết

### 2.2. Triển khai lên Vercel

1. **Đẩy code lên GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Triển khai trên Vercel**:
   - Đăng nhập vào [Vercel](https://vercel.com)
   - Nhấp vào "Add New" > "Project"
   - Chọn repository GitHub của bạn
   - Cấu hình như sau:
     - Framework Preset: Next.js
     - Root Directory: `/frontend/fe-quanlikhachsan`
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Environment Variables: 
       - `NEXT_PUBLIC_API_URL`: `https://hotel-management-api.onrender.com/api`

3. **Kiểm tra triển khai**:
   - Vercel sẽ cung cấp URL như `https://hotel-management-frontend.vercel.app`
   - Truy cập URL để kiểm tra frontend đã hoạt động chưa

## 3. Triển khai Backend (Render)

### 3.1. Chuẩn bị code

1. **Cập nhật CORS**:
   - File `Program.cs` đã được cập nhật để cho phép nhiều origins
   - File `appsettings.Production.json` đã được tạo với cấu hình cho production

2. **Cấu hình Docker**:
   - File `Dockerfile` đã được tạo để build container
   - File `.dockerignore` đã được tạo để loại bỏ các file không cần thiết

### 3.2. Triển khai lên Render

1. **Đẩy code lên GitHub**:
   ```bash
   git add .
   git commit -m "Prepare backend for deployment"
   git push origin main
   ```

2. **Triển khai trên Render**:
   - Đăng nhập vào [Render](https://render.com)
   - Chọn "New" > "Web Service"
   - Kết nối với repository GitHub của bạn
   - Cấu hình như sau:
     - Name: `hotel-management-api`
     - Region: Singapore (hoặc region gần nhất)
     - Branch: `main`
     - Root Directory: `/backend/be-quanlikhachsanapi`
     - Runtime: Docker
     - Instance Type: Free (hoặc paid nếu cần)
     - Environment Variables (nếu cần):
       - `ASPNETCORE_ENVIRONMENT`: `Production`

3. **Kiểm tra triển khai**:
   - Render sẽ cung cấp URL như `https://hotel-management-api.onrender.com`
   - Truy cập `https://hotel-management-api.onrender.com/swagger` để kiểm tra API

## 4. Kết nối Frontend với Backend

1. **Cập nhật URL Backend trong Vercel**:
   - Đăng nhập vào Vercel Dashboard
   - Chọn dự án frontend của bạn
   - Vào tab "Settings" > "Environment Variables"
   - Cập nhật `NEXT_PUBLIC_API_URL` với URL backend thực tế
   - Nhấp vào "Save" và "Redeploy"

2. **Cập nhật CORS trong Backend**:
   - Đảm bảo domain frontend đã được thêm vào danh sách `AllowedOrigins` trong `appsettings.Production.json`
   - Redeploy backend nếu cần

## 5. Kiểm tra Hệ thống

1. **Kiểm tra Frontend**:
   - Đăng nhập/Đăng ký
   - Tìm kiếm và đặt phòng
   - Xem thông tin cá nhân
   - Kiểm tra các chức năng khác

2. **Kiểm tra Backend**:
   - Sử dụng Swagger UI để test các API
   - Kiểm tra logs trên Render để phát hiện lỗi

3. **Kiểm tra Kết nối Database**:
   - Đảm bảo dữ liệu được lưu trữ và truy xuất đúng
   - Kiểm tra các thao tác CRUD

4. **Kiểm tra Supabase Storage**:
   - Upload hình ảnh và kiểm tra xem có được lưu trữ đúng không
   - Kiểm tra URL hình ảnh có hoạt động không

## 6. Xử lý Sự cố

### 6.1. Lỗi CORS

Nếu gặp lỗi CORS:
1. Kiểm tra `AllowedOrigins` trong `appsettings.Production.json`
2. Đảm bảo URL frontend chính xác (bao gồm cả protocol https://)
3. Redeploy backend

### 6.2. Lỗi Kết nối Database

Nếu không kết nối được database:
1. Kiểm tra connection string trong `appsettings.Production.json`
2. Đảm bảo IP của Render được whitelist trong firewall của SQL Server
3. Kiểm tra logs trên Render

### 6.3. Lỗi Supabase Storage

Nếu không upload được file:
1. Kiểm tra cấu hình Supabase trong `appsettings.Production.json`
2. Đảm bảo bucket đã được tạo và có quyền truy cập đúng
3. Kiểm tra logs để xem lỗi chi tiết

## 7. Bảo trì và Cập nhật

### 7.1. Cập nhật Frontend

1. Thực hiện thay đổi trong code local
2. Commit và push lên GitHub
3. Vercel sẽ tự động triển khai phiên bản mới

### 7.2. Cập nhật Backend

1. Thực hiện thay đổi trong code local
2. Commit và push lên GitHub
3. Render sẽ tự động triển khai phiên bản mới

---

## Thông tin Triển khai

- **Frontend URL**: https://hotel-management-frontend.vercel.app
- **Backend URL**: https://hotel-management-api.onrender.com
- **Swagger UI**: https://hotel-management-api.onrender.com/swagger
- **GitHub Repository**: [Link to your GitHub repo]

---

*Lưu ý: Cập nhật các URL thực tế sau khi triển khai thành công.*