# 🚀 HƯỚNG DẪN DEPLOY FRONTEND LÊN VERCEL

## ❌ VẤN ĐỀ HIỆN TẠI
Frontend trên Vercel hiển thị "Không thể tải dữ liệu từ server" vì:
1. Frontend đang gọi localhost thay vì Render URL
2. Environment variables chưa được set trên Vercel
3. CORS có thể chưa được cấu hình đúng

## ✅ GIẢI PHÁP ĐÃ THỰC HIỆN

### 1. Đã sửa cấu hình API URL
- ✅ `config.ts`: Fallback về Render URL thay vì localhost
- ✅ `api.ts`: Cập nhật API base URL
- ✅ `supabase.js`: Cập nhật image URL handling
- ✅ `next.config.js`: Thêm Render domain cho images

### 2. Đã tạo file .env.production
- ✅ Set `NEXT_PUBLIC_API_URL=https://passion-quan-li-khach-san.onrender.com/api`

## 🔧 BƯỚC DEPLOY TRÊN VERCEL

### Bước 1: Commit và Push code mới
```bash
git add .
git commit -m "Fix frontend API URL for production deployment"
git push origin main
```

### Bước 2: Cấu hình Environment Variables trên Vercel
1. Đăng nhập https://vercel.com
2. Vào project "passion-quan-li-khach-san"
3. Vào tab **Settings** → **Environment Variables**
4. Thêm biến môi trường:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://passion-quan-li-khach-san.onrender.com/api
   Environment: Production, Preview, Development
   ```
5. Nhấn **Save**

### Bước 3: Redeploy Frontend
1. Vào tab **Deployments**
2. Nhấn vào deployment mới nhất
3. Nhấn **Redeploy** để áp dụng environment variables

### Bước 4: Kiểm tra kết quả
Sau khi redeploy thành công:
1. Truy cập frontend Vercel URL
2. Mở Developer Tools (F12) → Console
3. Kiểm tra API calls có gọi đúng Render URL không

## 🔍 TROUBLESHOOTING

### Nếu vẫn hiển thị "Không thể tải dữ liệu"
1. **Kiểm tra Console**: F12 → Console tab để xem lỗi cụ thể
2. **Kiểm tra Network**: F12 → Network tab để xem API calls
3. **Test API trực tiếp**: Truy cập https://passion-quan-li-khach-san.onrender.com/api/health

### Nếu CORS lỗi
1. Đảm bảo Vercel URL được thêm vào CORS trong backend
2. Kiểm tra headers trong Network tab

### Nếu Environment Variables không hoạt động
1. Đảm bảo đã set cho tất cả environments (Production, Preview, Development)
2. Redeploy sau khi thêm environment variables
3. Kiểm tra trong build logs xem biến có được load không

## 📋 CHECKLIST DEPLOY

- [ ] Code frontend đã được commit và push
- [ ] Environment variable `NEXT_PUBLIC_API_URL` đã được set trên Vercel
- [ ] Frontend đã được redeploy
- [ ] API calls gọi đúng Render URL (kiểm tra trong Network tab)
- [ ] Backend API hoạt động: https://passion-quan-li-khach-san.onrender.com/api/health
- [ ] Frontend có thể load dữ liệu thành công

## 🎯 KẾT QUẢ MONG MUỐN

Sau khi hoàn thành:
- ✅ Frontend Vercel hiển thị dữ liệu bình thường
- ✅ API calls gọi đúng Render URL
- ✅ Không còn lỗi "Không thể tải dữ liệu từ server"
- ✅ Console không có lỗi CORS hoặc network

## 🚨 LƯU Ý QUAN TRỌNG

1. **Environment Variables**: Phải set cho tất cả environments
2. **Redeploy**: Bắt buộc sau khi thêm environment variables
3. **Cache**: Có thể cần clear browser cache sau khi deploy
4. **Cold Start**: Render free tier có thể mất 30-60s để khởi động

## 📞 HỖ TRỢ

Nếu vẫn gặp lỗi:
1. Gửi screenshot Console errors
2. Gửi screenshot Network tab
3. Kiểm tra Vercel build logs
4. Test API trực tiếp trên browser
