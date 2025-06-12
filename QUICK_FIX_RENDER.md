# 🚨 KHẮC PHỤC NHANH LỖI RENDER

## ⚡ THỰC HIỆN NGAY

### 1. Commit code đã sửa
```bash
git add .
git commit -m "Fix Render port configuration and enable Swagger for production"
git push origin main
```

### 2. Cấu hình Render Dashboard
1. Vào https://dashboard.render.com
2. Chọn service "passion-quan-li-khach-san"
3. Tab **Settings** → **Environment Variables**
4. Thêm/sửa:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:$PORT
   ```

### 3. Manual Deploy
1. Tab **Manual Deploy**
2. Nhấn **Deploy latest commit**
3. Chờ 5-10 phút

### 4. Kiểm tra kết quả
```powershell
# Chạy script test
.\test-deployment.ps1
```

Hoặc truy cập trực tiếp:
- https://passion-quan-li-khach-san.onrender.com/
- https://passion-quan-li-khach-san.onrender.com/swagger

## 🔧 CÁC THAY ĐỔI ĐÃ THỰC HIỆN

### Program.cs
- ✅ Sử dụng dynamic port từ `$PORT`
- ✅ Enable Swagger cho Production
- ✅ Cập nhật CORS settings

### Dockerfile  
- ✅ Sử dụng `$PORT` thay vì hardcode 8080
- ✅ Cấu hình environment variables

### appsettings.Production.json
- ✅ Thêm cấu hình đầy đủ cho production
- ✅ Cập nhật AllowedOrigins

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi hoàn thành, bạn sẽ thấy:
- ✅ API chạy bình thường tại root URL
- ✅ Swagger UI hoạt động tại /swagger  
- ✅ Health check trả về status healthy
- ✅ Frontend có thể gọi API thành công

## 🚨 NẾU VẪN LỖI

1. **Kiểm tra Logs**: Render Dashboard → Logs tab
2. **Chờ thêm**: Free tier cần 2-3 phút để khởi động
3. **Restart Service**: Settings → Restart Service
4. **Liên hệ**: Gửi screenshot logs nếu vẫn lỗi
