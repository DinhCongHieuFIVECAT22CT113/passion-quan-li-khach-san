# 🚀 HƯỚNG DẪN DEPLOYMENT - DỰ ÁN QUẢN LÝ KHÁCH SẠN

## 📖 Tổng quan

Dự án này bao gồm:
- **Frontend**: Next.js (React) - Deploy lên Vercel
- **Backend**: .NET Core API - Deploy lên Render
- **Database**: SQL Server (Cloud)
- **Storage**: Supabase

## 🎯 Quick Start

### 1. Chạy script setup (Windows)
```powershell
.\deploy-setup.ps1
```

### 2. Hoặc setup thủ công

#### Frontend Setup
```bash
cd frontend/fe-quanlikhachsan
npm install
npm run build  # Test build
```

#### Backend Setup
```bash
cd backend/be-quanlikhachsanapi
dotnet restore
dotnet build   # Test build
```

## 📋 Các file quan trọng

### Frontend
- `frontend/fe-quanlikhachsan/vercel.json` - Cấu hình Vercel
- `frontend/fe-quanlikhachsan/.env.example` - Template environment variables
- `frontend/fe-quanlikhachsan/package.json` - Dependencies và scripts

### Backend
- `backend/be-quanlikhachsanapi/Dockerfile` - Container configuration
- `backend/be-quanlikhachsanapi/.dockerignore` - Files to ignore in Docker
- `backend/be-quanlikhachsanapi/appsettings.Production.json` - Production config

## 🌐 Deployment URLs

Sau khi deploy thành công:
- **Frontend**: `https://[your-project].vercel.app`
- **Backend**: `https://[your-service].onrender.com`
- **API Docs**: `https://[your-service].onrender.com/swagger`

## 📚 Tài liệu chi tiết

1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Hướng dẫn deploy từng bước chi tiết
2. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Checklist để đảm bảo deploy thành công

## 🔧 Environment Variables

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
```

### Backend (Render)
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:$PORT
ConnectionStrings__DefaultConnection=your-database-connection-string
Supabase__Url=your-supabase-url
Supabase__Key=your-supabase-key
Supabase__BucketName=your-bucket-name
```

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) phần "Xử lý sự cố"
2. Xem logs trên Vercel/Render Dashboard
3. Kiểm tra console browser cho frontend issues

## 📞 Liên hệ

- GitHub Issues: [Link to your repo issues]
- Email: [your-email@example.com]

---

**Lưu ý**: Đảm bảo đã đọc kỹ DEPLOYMENT_GUIDE.md trước khi bắt đầu deploy!
