# 🚀 Render Environment Variables Setup

## Backend Environment Variables (Render)

Cấu hình các biến môi trường sau trong Render Dashboard:

### 1. Database Connection
```
ConnectionStrings__DefaultConnection=Server=118.69.126.49;Database=data_QLKS_113_Nhom2;User Id=User_113_nhom2;Password=123456789;MultipleActiveResultSets=True;TrustServerCertificate=True;
```

### 2. JWT Configuration
```
TokenKey=fBgm@_3lhh%N6VR;B&%[[%g9d$muL_7z_SuperSecretKeyForJWTAuthentication2024_HotelManagement_System_Production_Key_64Characters
Jwt__SecretKey=fBgm@_3lhh%N6VR;B&%[[%g9d$muL_7z_SuperSecretKeyForJWTAuthentication2024_HotelManagement_System_Production_Key_64Characters
```

### 3. CORS Origins
```
AllowedOrigins__0=https://passion-quan-li-khach-san.vercel.app
AllowedOrigins__1=https://passion-quan-li-khach-san-git-main-conghieus-projects.vercel.app
AllowedOrigins__2=http://localhost:3000
```

### 4. Email Configuration
```
Gmail__Host=smtp.gmail.com
Gmail__Port=587
Gmail__Username=occhoe8104@gmail.com
Gmail__Password=miyyxsurzgabbgci
```

### 5. Supabase Configuration
```
Supabase__Url=https://ttumqjufzmvfkccnyxfx.supabase.co
Supabase__Key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dW1xanVmem12ZmtjY255eGZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNzI0NDcsImV4cCI6MjA2NDk0ODQ0N30.5yE_qHw-RP_eRoFdevkKgFw_trSJhpv2hwBinoGvcow
Supabase__ServiceKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dW1xanVmem12ZmtjY255eGZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM3MjQ0NywiZXhwIjoyMDY0OTQ4NDQ3fQ.7seGaMuKg-MZNCaKIYrJRJC_x1-FwjynMctJw5xoFXE
Supabase__BucketName=hotel-images
```

### 6. Environment
```
ASPNETCORE_ENVIRONMENT=Production
```

## Frontend Environment Variables (Vercel)

### 1. API URL
```
NEXT_PUBLIC_API_URL=https://passion-quan-li-khach-san.onrender.com/api
```

## 📋 Checklist Deploy

### Backend (Render)
- [ ] Tạo Web Service mới
- [ ] Connect GitHub repository
- [ ] Set Build Command: `dotnet publish -c Release -o out`
- [ ] Set Start Command: `dotnet out/be-quanlikhachsanapi.dll`
- [ ] Set Root Directory: `backend/be-quanlikhachsanapi`
- [ ] Thêm tất cả Environment Variables ở trên
- [ ] Deploy

### Frontend (Vercel)
- [ ] Connect GitHub repository
- [ ] Set Root Directory: `frontend/fe-quanlikhachsan`
- [ ] Set Build Command: `npm run build`
- [ ] Set Output Directory: `.next`
- [ ] Thêm Environment Variables
- [ ] Deploy

## 🔧 Troubleshooting

### Lỗi JWT Key Size
- Đảm bảo TokenKey có ít nhất 64 ký tự
- Kiểm tra environment variables đã set đúng

### Lỗi CORS
- Kiểm tra AllowedOrigins có chứa domain frontend
- Đảm bảo không có trailing slash

### Lỗi Database
- Kiểm tra connection string
- Đảm bảo database server accessible từ Render

## 🎯 Test Endpoints

### Health Check
```
GET https://passion-quan-li-khach-san.onrender.com/api/health
```

### Login Test
```
POST https://passion-quan-li-khach-san.onrender.com/api/Auth/login
Content-Type: multipart/form-data

UserName: admin
Password: admin123
```
