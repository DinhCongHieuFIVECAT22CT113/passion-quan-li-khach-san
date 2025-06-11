# CHECKLIST TRIỂN KHAI DỰ ÁN QUẢN LÝ KHÁCH SẠN

## 📋 CHUẨN BỊ TRƯỚC KHI DEPLOY

### 🔧 Môi trường phát triển
- [ ] Node.js 18+ đã được cài đặt
- [ ] .NET 8.0 SDK đã được cài đặt
- [ ] Git đã được cài đặt và cấu hình
- [ ] Code đã được test kỹ trên local environment

### 🌐 Tài khoản dịch vụ
- [ ] Tài khoản GitHub (để host code)
- [ ] Tài khoản Vercel (cho frontend)
- [ ] Tài khoản Render (cho backend)
- [ ] Database SQL Server đã sẵn sàng
- [ ] Supabase account và bucket đã được setup

### 📁 Cấu hình dự án
- [ ] File `vercel.json` đã có trong frontend
- [ ] File `Dockerfile` đã có trong backend
- [ ] File `.dockerignore` đã có trong backend
- [ ] Environment variables đã được chuẩn bị

## 🚀 QUY TRÌNH DEPLOY

### 1️⃣ Đẩy code lên GitHub
- [ ] Repository đã được tạo trên GitHub
- [ ] Code đã được push lên branch main
- [ ] Tất cả files cần thiết đã được commit

### 2️⃣ Deploy Backend lên Render
- [ ] Đã tạo Web Service trên Render
- [ ] Root directory đã set: `backend/be-quanlikhachsanapi`
- [ ] Runtime đã chọn: Docker
- [ ] Environment variables đã được cấu hình:
  - [ ] `ASPNETCORE_ENVIRONMENT=Production`
  - [ ] `ASPNETCORE_URLS=http://+:$PORT`
  - [ ] Database connection string
  - [ ] Supabase configuration
- [ ] Build và deploy thành công
- [ ] API endpoint có thể truy cập được
- [ ] Swagger UI hoạt động: `/swagger`

### 3️⃣ Deploy Frontend lên Vercel
- [ ] Đã tạo project trên Vercel
- [ ] Root directory đã set: `frontend/fe-quanlikhachsan`
- [ ] Framework preset: Next.js
- [ ] Environment variables đã được cấu hình:
  - [ ] `NEXT_PUBLIC_API_URL` với URL backend từ Render
- [ ] Build và deploy thành công
- [ ] Website có thể truy cập được

### 4️⃣ Kết nối Frontend và Backend
- [ ] CORS đã được cấu hình trong backend với URL frontend
- [ ] Frontend có thể gọi API thành công
- [ ] Authentication hoạt động
- [ ] File upload/download hoạt động

## ✅ KIỂM TRA SAU KHI DEPLOY

### 🔍 Kiểm tra Backend
- [ ] API endpoints trả về response đúng
- [ ] Database connection hoạt động
- [ ] Swagger documentation accessible
- [ ] Logs không có error nghiêm trọng
- [ ] Authentication/Authorization hoạt động
- [ ] File upload to Supabase hoạt động

### 🔍 Kiểm tra Frontend
- [ ] Trang chủ load thành công
- [ ] Navigation hoạt động
- [ ] API calls thành công (check Network tab)
- [ ] Authentication flow hoạt động
- [ ] Responsive design trên mobile
- [ ] Console không có error nghiêm trọng

### 🔍 Kiểm tra tích hợp
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập/đăng xuất
- [ ] Tìm kiếm và xem danh sách phòng
- [ ] Đặt phòng (nếu có)
- [ ] Upload hình ảnh
- [ ] Các chức năng admin (nếu có)

## 🐛 XỬ LÝ SỰ CỐ

### ❌ Nếu Backend build fail
- [ ] Kiểm tra logs trên Render
- [ ] Verify Dockerfile syntax
- [ ] Test build local: `dotnet build`
- [ ] Check dependencies và packages

### ❌ Nếu Frontend build fail
- [ ] Kiểm tra logs trên Vercel
- [ ] Test build local: `npm run build`
- [ ] Fix TypeScript errors
- [ ] Check dependencies

### ❌ Nếu CORS error
- [ ] Verify frontend URL trong backend CORS policy
- [ ] Đảm bảo URL chính xác (https://, không có trailing slash)
- [ ] Redeploy backend sau khi fix

### ❌ Nếu Database connection fail
- [ ] Verify connection string
- [ ] Check database server firewall
- [ ] Ensure Render IP is whitelisted
- [ ] Test connection từ local

## 📝 THÔNG TIN DEPLOYMENT

### 🔗 URLs
- **Frontend**: `https://[project-name].vercel.app`
- **Backend**: `https://[service-name].onrender.com`
- **API Docs**: `https://[service-name].onrender.com/swagger`

### 🔑 Environment Variables

#### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://[backend-url]/api
```

#### Backend (Render)
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:$PORT
ConnectionStrings__DefaultConnection=[database-connection-string]
Supabase__Url=[supabase-url]
Supabase__Key=[supabase-key]
Supabase__BucketName=[bucket-name]
```

## 📞 HỖ TRỢ

### 📚 Tài liệu tham khảo
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [.NET Core Docker](https://docs.microsoft.com/en-us/dotnet/core/docker/)

### 🔧 Debug tools
- **Vercel**: Function logs, Build logs
- **Render**: Service logs, Metrics
- **Browser**: Developer Tools, Network tab, Console

---

**Lưu ý**: Checklist này nên được thực hiện theo thứ tự và đánh dấu hoàn thành từng bước để đảm bảo deployment thành công.
