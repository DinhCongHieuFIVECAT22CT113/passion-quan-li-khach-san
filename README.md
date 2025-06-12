# 🏨 Hotel Management System

Hệ thống quản lý khách sạn với frontend Next.js và backend .NET Core API.

## 🌐 Live Demo

- **Frontend**: https://passion-quan-li-khach-san.vercel.app
- **Backend API**: https://passion-quan-li-khach-san.onrender.com
- **API Documentation**: https://passion-quan-li-khach-san.onrender.com/swagger

## 🔑 Demo Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Full system access

## 🚀 Quick Deploy

```bash
# Clone repository
git clone <repository-url>
cd hotel-management-system

# Run deploy script
./deploy.ps1
```

## 📁 Project Structure

```
├── frontend/fe-quanlikhachsan/     # Next.js Frontend
├── backend/be-quanlikhachsanapi/   # .NET Core API
├── RENDER_ENV_SETUP.md             # Environment variables guide
├── deploy.ps1                      # Deploy script
└── README.md                       # This file
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: React Context
- **Authentication**: JWT
- **Deployment**: Vercel

### Backend
- **Framework**: .NET Core 8.0
- **Database**: SQL Server
- **Authentication**: JWT Bearer
- **File Storage**: Supabase
- **Email**: Gmail SMTP
- **Deployment**: Render

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- .NET 8.0 SDK
- SQL Server

### Backend Setup
```bash
cd backend/be-quanlikhachsanapi
dotnet restore
dotnet run
```

### Frontend Setup
```bash
cd frontend/fe-quanlikhachsan
npm install
npm run dev
```

## 🌍 Production Deployment

### Backend (Render)
1. Connect GitHub repository
2. Set build command: `dotnet publish -c Release -o out`
3. Set start command: `dotnet out/be-quanlikhachsanapi.dll`
4. Configure environment variables (see RENDER_ENV_SETUP.md)

### Frontend (Vercel)
1. Connect GitHub repository
2. Set root directory: `frontend/fe-quanlikhachsan`
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL=https://passion-quan-li-khach-san.onrender.com/api`

## 📋 Features

- 🏠 **Dashboard**: Overview and analytics
- 🛏️ **Room Management**: Room types, availability, pricing
- 👥 **Customer Management**: Customer profiles, booking history
- 📅 **Booking System**: Reservations, check-in/out
- 💰 **Invoice Management**: Billing, payments, reports
- 🎯 **Services & Promotions**: Additional services, discounts
- ⭐ **Reviews**: Customer feedback system
- 👨‍💼 **Staff Management**: Employee roles, permissions
- 📊 **Reports**: Revenue, occupancy analytics

## 🔐 Security Features

- JWT Authentication with refresh tokens
- Role-based access control
- Password hashing with ASP.NET Core Identity
- CORS protection
- Input validation and sanitization

## 📞 Support

For issues and questions, please check the documentation or create an issue in the repository.

## 📄 License

This project is for educational purposes.
