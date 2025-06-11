# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN QUẢN LÝ KHÁCH SẠN

## 1. Tổng quan

Hướng dẫn này mô tả các bước chi tiết để triển khai dự án Quản lý Khách sạn lên các nền tảng cloud:
- **Frontend (Next.js)**: Triển khai lên Vercel
- **Backend (.NET Core API)**: Triển khai lên Render
- **Database**: SQL Server cloud (đã cấu hình)
- **Storage**: Supabase (đã cấu hình)

## 2. YÊU CẦU TRƯỚC KHI TRIỂN KHAI

### 2.1. Tài khoản cần thiết
- Tài khoản GitHub (để lưu trữ code)
- Tài khoản Vercel (miễn phí)
- Tài khoản Render (miễn phí)

### 2.2. Chuẩn bị môi trường local
- Node.js (phiên bản 18 trở lên)
- .NET 8.0 SDK
- Git

## 3. TRIỂN KHAI FRONTEND LÊN VERCEL

### 3.1. Chuẩn bị code Frontend

1. **Kiểm tra cấu hình API URL**:
   Tạo file `.env.local` trong thư mục `frontend/fe-quanlikhachsan/`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

2. **Tạo file `.env.production`** trong thư mục `frontend/fe-quanlikhachsan/`:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   ```

3. **Kiểm tra file `vercel.json`** (đã có sẵn):
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "regions": ["sin1"]
   }
   ```

### 3.2. Đẩy code lên GitHub

1. **Tạo repository trên GitHub**:
   - Đăng nhập vào GitHub
   - Tạo repository mới (ví dụ: `hotel-management-system`)
   - Chọn Public hoặc Private

2. **Đẩy code lên GitHub**:
   ```bash
   # Trong thư mục gốc của dự án
   git init
   git add .
   git commit -m "Initial commit - Hotel Management System"
   git branch -M main
   git remote add origin https://github.com/your-username/hotel-management-system.git
   git push -u origin main
   ```

### 3.3. Triển khai trên Vercel

1. **Đăng nhập Vercel**:
   - Truy cập [vercel.com](https://vercel.com)
   - Đăng nhập bằng tài khoản GitHub

2. **Tạo dự án mới**:
   - Nhấp "Add New" → "Project"
   - Chọn repository GitHub vừa tạo
   - Nhấp "Import"

3. **Cấu hình dự án**:
   - **Project Name**: `hotel-management-frontend`
   - **Framework Preset**: Next.js (tự động phát hiện)
   - **Root Directory**: `frontend/fe-quanlikhachsan`
   - **Build Command**: `npm run build` (mặc định)
   - **Output Directory**: `.next` (mặc định)
   - **Install Command**: `npm install` (mặc định)

4. **Cấu hình Environment Variables**:
   - Trong phần "Environment Variables", thêm:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://your-backend-url.onrender.com/api` (sẽ cập nhật sau khi deploy backend)
     - **Environment**: Production

5. **Deploy**:
   - Nhấp "Deploy"
   - Chờ quá trình build hoàn thành (khoảng 2-5 phút)

6. **Kiểm tra kết quả**:
   - Vercel sẽ cung cấp URL như: `https://hotel-management-frontend.vercel.app`
   - Truy cập URL để kiểm tra (có thể sẽ lỗi API vì chưa deploy backend)

## 4. TRIỂN KHAI BACKEND LÊN RENDER

### 4.1. Chuẩn bị code Backend

1. **Kiểm tra file `Dockerfile`** (đã có sẵn):
   ```dockerfile
   FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
   WORKDIR /app

   # Copy csproj và restore dependencies
   COPY ["be-quanlikhachsanapi.csproj", "./"]
   RUN dotnet restore "./be-quanlikhachsanapi.csproj"

   # Copy everything else and build
   COPY . .
   RUN dotnet publish "be-quanlikhachsanapi.csproj" -c Release -o out

   # Build runtime image
   FROM mcr.microsoft.com/dotnet/aspnet:8.0
   WORKDIR /app
   COPY --from=build /app/out .

   # Expose port
   EXPOSE 8080

   # Set environment variables
   ENV ASPNETCORE_URLS=http://+:8080
   ENV ASPNETCORE_ENVIRONMENT=Production

   # Start the app
   ENTRYPOINT ["dotnet", "be-quanlikhachsanapi.dll"]
   ```

2. **Tạo file `.dockerignore`** trong thư mục `backend/be-quanlikhachsanapi/`:
   ```
   bin/
   obj/
   .vs/
   .vscode/
   *.user
   *.suo
   .git/
   .gitignore
   README.md
   Dockerfile
   .dockerignore
   node_modules/
   npm-debug.log
   ```

3. **Kiểm tra cấu hình CORS trong `Program.cs`**:
   Đảm bảo có cấu hình CORS cho phép frontend domain:
   ```csharp
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("AllowSpecificOrigins", policy =>
       {
           policy.WithOrigins(
               "http://localhost:3000",
               "https://your-frontend-url.vercel.app"
           )
           .AllowAnyHeader()
           .AllowAnyMethod()
           .AllowCredentials();
       });
   });
   ```

4. **Cập nhật `appsettings.Production.json`**:
   ```json
   {
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning"
       }
     },
     "AllowedHosts": "*",
     "ConnectionStrings": {
       "DefaultConnection": "your-production-connection-string"
     },
     "Supabase": {
       "Url": "your-supabase-url",
       "Key": "your-supabase-key",
       "BucketName": "your-bucket-name"
     }
   }
   ```

### 4.2. Triển khai trên Render

1. **Đăng nhập Render**:
   - Truy cập [render.com](https://render.com)
   - Đăng nhập bằng tài khoản GitHub

2. **Tạo Web Service mới**:
   - Nhấp "New" → "Web Service"
   - Chọn "Build and deploy from a Git repository"
   - Chọn repository GitHub của bạn
   - Nhấp "Connect"

3. **Cấu hình dự án**:
   - **Name**: `hotel-management-api`
   - **Region**: Singapore (hoặc gần nhất)
   - **Branch**: `main`
   - **Root Directory**: `backend/be-quanlikhachsanapi`
   - **Runtime**: Docker
   - **Instance Type**: Free (hoặc Starter $7/tháng cho hiệu suất tốt hơn)

4. **Cấu hình Environment Variables**:
   Thêm các biến môi trường sau:
   - `ASPNETCORE_ENVIRONMENT`: `Production`
   - `ASPNETCORE_URLS`: `http://+:$PORT`
   - Các biến khác từ `appsettings.Production.json` nếu cần

5. **Deploy**:
   - Nhấp "Create Web Service"
   - Chờ quá trình build và deploy (khoảng 5-10 phút)

6. **Kiểm tra kết quả**:
   - Render sẽ cung cấp URL như: `https://hotel-management-api.onrender.com`
   - Truy cập `https://hotel-management-api.onrender.com/swagger` để kiểm tra API

## 5. KẾT NỐI FRONTEND VÀ BACKEND

### 5.1. Cập nhật URL Backend trong Vercel

1. **Lấy URL Backend từ Render**:
   - Sau khi deploy backend thành công, copy URL từ Render Dashboard
   - URL sẽ có dạng: `https://hotel-management-api.onrender.com`

2. **Cập nhật Environment Variables trong Vercel**:
   - Đăng nhập vào Vercel Dashboard
   - Chọn dự án frontend của bạn
   - Vào tab "Settings" → "Environment Variables"
   - Tìm biến `NEXT_PUBLIC_API_URL`
   - Cập nhật value thành: `https://hotel-management-api.onrender.com/api`
   - Nhấp "Save"

3. **Redeploy Frontend**:
   - Vào tab "Deployments"
   - Nhấp vào deployment mới nhất
   - Nhấp "Redeploy" để áp dụng biến môi trường mới

### 5.2. Cập nhật CORS trong Backend

1. **Lấy URL Frontend từ Vercel**:
   - Copy URL frontend từ Vercel Dashboard
   - URL sẽ có dạng: `https://hotel-management-frontend.vercel.app`

2. **Cập nhật CORS trong code**:
   - Mở file `Program.cs` trong backend
   - Thêm URL frontend vào danh sách CORS:
   ```csharp
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("AllowSpecificOrigins", policy =>
       {
           policy.WithOrigins(
               "http://localhost:3000",
               "https://hotel-management-frontend.vercel.app"  // Thêm URL thực tế
           )
           .AllowAnyHeader()
           .AllowAnyMethod()
           .AllowCredentials();
       });
   });
   ```

3. **Commit và push code**:
   ```bash
   git add .
   git commit -m "Update CORS for production frontend URL"
   git push origin main
   ```

4. **Render sẽ tự động redeploy backend**

## 6. KIỂM TRA HỆ THỐNG

### 6.1. Kiểm tra Backend

1. **Kiểm tra API hoạt động**:
   - Truy cập: `https://your-backend-url.onrender.com/swagger`
   - Kiểm tra các endpoint có hoạt động không
   - Test một vài API đơn giản

2. **Kiểm tra logs**:
   - Vào Render Dashboard → chọn service backend
   - Vào tab "Logs" để xem logs realtime
   - Kiểm tra có lỗi gì không

### 6.2. Kiểm tra Frontend

1. **Kiểm tra trang chủ**:
   - Truy cập URL frontend từ Vercel
   - Kiểm tra trang load có bình thường không
   - Kiểm tra console browser có lỗi không

2. **Kiểm tra kết nối API**:
   - Thử đăng nhập/đăng ký
   - Kiểm tra danh sách phòng có load được không
   - Test các chức năng cơ bản

### 6.3. Kiểm tra Database và Storage

1. **Kiểm tra Database**:
   - Thử tạo tài khoản mới
   - Kiểm tra dữ liệu có được lưu vào database không
   - Test các thao tác CRUD

2. **Kiểm tra Supabase Storage**:
   - Thử upload hình ảnh
   - Kiểm tra hình ảnh có hiển thị đúng không
   - Verify URL hình ảnh có accessible không

## 7. XỬ LÝ SỰ CỐ THƯỜNG GẶP

### 7.1. Lỗi CORS (Cross-Origin Resource Sharing)

**Triệu chứng**: Console browser hiển thị lỗi CORS khi frontend gọi API

**Cách khắc phục**:
1. Kiểm tra URL frontend đã được thêm vào CORS policy trong `Program.cs`
2. Đảm bảo URL chính xác (bao gồm https://, không có dấu `/` cuối)
3. Commit và push code để Render redeploy
4. Chờ 2-3 phút để deployment hoàn thành

### 7.2. Lỗi Build Frontend trên Vercel

**Triệu chứng**: Build failed với lỗi TypeScript hoặc dependency

**Cách khắc phục**:
1. Kiểm tra logs build trên Vercel Dashboard
2. Đảm bảo tất cả dependencies đã được install:
   ```bash
   cd frontend/fe-quanlikhachsan
   npm install
   npm run build  # Test build local
   ```
3. Fix lỗi TypeScript nếu có
4. Push code và redeploy

### 7.3. Lỗi Build Backend trên Render

**Triệu chứng**: Build failed với lỗi .NET

**Cách khắc phục**:
1. Kiểm tra logs build trên Render Dashboard
2. Đảm bảo Dockerfile đúng cú pháp
3. Test build local:
   ```bash
   cd backend/be-quanlikhachsanapi
   dotnet restore
   dotnet build
   dotnet publish -c Release -o out
   ```
4. Fix lỗi và push code

### 7.4. Lỗi Database Connection

**Triệu chứng**: API trả về lỗi database connection

**Cách khắc phục**:
1. Kiểm tra connection string trong environment variables
2. Đảm bảo database server cho phép kết nối từ IP của Render
3. Kiểm tra firewall settings của database server
4. Test connection string bằng SQL Management Studio

### 7.5. Lỗi Environment Variables

**Triệu chứng**: Ứng dụng không hoạt động đúng, thiếu cấu hình

**Cách khắc phục**:
1. **Vercel**: Settings → Environment Variables
2. **Render**: Settings → Environment Variables
3. Đảm bảo tất cả biến cần thiết đã được set
4. Redeploy sau khi thay đổi environment variables

## 8. BẢO TRÌ VÀ CẬP NHẬT

### 8.1. Quy trình cập nhật Frontend

1. **Phát triển local**:
   ```bash
   cd frontend/fe-quanlikhachsan
   npm run dev  # Test thay đổi
   ```

2. **Deploy lên production**:
   ```bash
   git add .
   git commit -m "Update frontend: [mô tả thay đổi]"
   git push origin main
   ```

3. **Vercel sẽ tự động deploy** (thường mất 2-3 phút)

### 8.2. Quy trình cập nhật Backend

1. **Phát triển local**:
   ```bash
   cd backend/be-quanlikhachsanapi
   dotnet run  # Test thay đổi
   ```

2. **Deploy lên production**:
   ```bash
   git add .
   git commit -m "Update backend: [mô tả thay đổi]"
   git push origin main
   ```

3. **Render sẽ tự động deploy** (thường mất 5-8 phút)

### 8.3. Monitoring và Logs

1. **Frontend Logs (Vercel)**:
   - Vercel Dashboard → Project → Functions tab
   - Real-time logs và error tracking

2. **Backend Logs (Render)**:
   - Render Dashboard → Service → Logs tab
   - Real-time logs và performance metrics

3. **Database Monitoring**:
   - Sử dụng SQL Server Management Studio
   - Monitor query performance và connections

## 9. THÔNG TIN TRIỂN KHAI

### 9.1. URLs Production
- **Frontend**: `https://[your-project-name].vercel.app`
- **Backend API**: `https://[your-service-name].onrender.com`
- **Swagger Documentation**: `https://[your-service-name].onrender.com/swagger`

### 9.2. Tài khoản và Dịch vụ
- **GitHub Repository**: `https://github.com/[username]/[repo-name]`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Render Dashboard**: `https://dashboard.render.com`

### 9.3. Cấu hình quan trọng
- **Frontend Root Directory**: `frontend/fe-quanlikhachsan`
- **Backend Root Directory**: `backend/be-quanlikhachsanapi`
- **Database**: SQL Server (cloud)
- **File Storage**: Supabase

---

## 10. CHECKLIST TRIỂN KHAI

### ✅ Trước khi deploy:
- [ ] Code đã được test kỹ trên local
- [ ] Tất cả dependencies đã được cài đặt
- [ ] Environment variables đã được chuẩn bị
- [ ] Database connection string đã sẵn sàng
- [ ] Supabase configuration đã được setup

### ✅ Sau khi deploy:
- [ ] Frontend load được trang chủ
- [ ] Backend API response qua Swagger
- [ ] CORS đã được cấu hình đúng
- [ ] Database connection hoạt động
- [ ] File upload/download hoạt động
- [ ] Authentication/Authorization hoạt động

---

*Cập nhật lần cuối: [Ngày hiện tại]*
*Phiên bản: 2.0*