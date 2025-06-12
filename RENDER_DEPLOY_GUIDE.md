# 🚀 HƯỚNG DẪN DEPLOY BACKEND LÊN RENDER

## ❌ VẤN ĐỀ HIỆN TẠI
Trang https://passion-quan-li-khach-san.onrender.com/ không chạy được vì:
1. Cấu hình port không đúng
2. Swagger không được enable cho Production
3. CORS settings chưa đầy đủ
4. Environment variables chưa được set đúng

## ✅ GIẢI PHÁP ĐÃ THỰC HIỆN

### 1. Đã sửa Program.cs
- Sử dụng dynamic port từ biến môi trường `$PORT`
- Enable Swagger cho Production environment
- Cập nhật CORS settings

### 2. Đã sửa Dockerfile
- Sử dụng `$PORT` thay vì hardcode 8080
- Cấu hình environment variables đúng

### 3. Đã tạo appsettings.Production.json
- Cấu hình đầy đủ cho production
- Thêm các AllowedOrigins cho frontend

## 🔧 BƯỚC DEPLOY TRÊN RENDER

### Bước 1: Commit và Push code mới
```bash
git add .
git commit -m "Fix Render deployment configuration"
git push origin main
```

### Bước 2: Cấu hình trên Render Dashboard
1. Đăng nhập https://render.com
2. Vào service "passion-quan-li-khach-san"
3. Vào tab **Settings**

### Bước 3: Kiểm tra cấu hình Build & Deploy
Đảm bảo các settings sau:
- **Runtime**: Docker
- **Root Directory**: `backend/be-quanlikhachsanapi`
- **Docker Command**: (để trống, sẽ dùng Dockerfile)

### Bước 4: Cấu hình Environment Variables
Thêm các biến môi trường sau trong tab **Environment**:

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:$PORT
PORT=8080
```

### Bước 5: Manual Deploy
1. Vào tab **Manual Deploy**
2. Nhấn **Deploy latest commit**
3. Chờ build hoàn thành (5-10 phút)

### Bước 6: Kiểm tra kết quả
Sau khi deploy thành công:
1. Truy cập: https://passion-quan-li-khach-san.onrender.com/
2. Kiểm tra API: https://passion-quan-li-khach-san.onrender.com/api/health
3. Kiểm tra Swagger: https://passion-quan-li-khach-san.onrender.com/swagger

## 🔍 TROUBLESHOOTING

### Nếu vẫn lỗi "Application failed to respond"
1. Kiểm tra Logs trong Render Dashboard
2. Đảm bảo database connection string đúng
3. Kiểm tra port binding

### Nếu Swagger không hiển thị
1. Đảm bảo đã enable Swagger cho Production
2. Truy cập đúng URL: `/swagger` (không phải `/swagger/index.html`)

### Nếu CORS lỗi
1. Kiểm tra AllowedOrigins trong appsettings.Production.json
2. Đảm bảo frontend URL được thêm vào danh sách

## 📋 CHECKLIST DEPLOY

- [ ] Code đã được commit và push
- [ ] Environment variables đã được set
- [ ] Manual deploy đã được thực hiện
- [ ] API endpoint hoạt động: `/`
- [ ] Health check hoạt động: `/api/health`
- [ ] Swagger UI hoạt động: `/swagger`
- [ ] Database connection thành công
- [ ] CORS cho phép frontend truy cập

## 🎯 KẾT QUẢ MONG MUỐN

Sau khi hoàn thành:
- ✅ https://passion-quan-li-khach-san.onrender.com/ → Hiển thị thông tin API
- ✅ https://passion-quan-li-khach-san.onrender.com/swagger → Swagger UI
- ✅ https://passion-quan-li-khach-san.onrender.com/api/health → Status healthy
- ✅ Frontend có thể gọi API thành công

## 🚨 LƯU Ý QUAN TRỌNG

1. **Free tier của Render**: Service sẽ sleep sau 15 phút không hoạt động
2. **Cold start**: Lần đầu truy cập sau khi sleep có thể mất 30-60 giây
3. **Database**: Đảm bảo SQL Server có thể truy cập từ internet
4. **Supabase**: Cần cấu hình đúng URL và Service Key nếu sử dụng

## 📞 HỖ TRỢ

Nếu vẫn gặp lỗi, hãy:
1. Kiểm tra Logs trong Render Dashboard
2. Gửi screenshot lỗi cụ thể
3. Kiểm tra network connectivity đến database
