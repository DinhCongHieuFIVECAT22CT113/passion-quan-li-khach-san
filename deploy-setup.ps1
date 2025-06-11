# PowerShell Script để setup deployment cho dự án Hotel Management
# Chạy script này để chuẩn bị các file cần thiết cho deployment

Write-Host "🚀 SETUP DEPLOYMENT CHO DỰ ÁN QUẢN LÝ KHÁCH SẠN" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Kiểm tra môi trường
Write-Host "`n📋 Kiểm tra môi trường..." -ForegroundColor Yellow

# Kiểm tra Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js chưa được cài đặt!" -ForegroundColor Red
    exit 1
}

# Kiểm tra .NET
try {
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ .NET SDK chưa được cài đặt!" -ForegroundColor Red
    exit 1
}

# Kiểm tra Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git chưa được cài đặt!" -ForegroundColor Red
    exit 1
}

# Tạo các file cấu hình nếu chưa có
Write-Host "`n📁 Tạo các file cấu hình..." -ForegroundColor Yellow

# Frontend .env.example
$frontendEnvExample = @"
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# For production, use your deployed backend URL:
# NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
"@

if (!(Test-Path "frontend/fe-quanlikhachsan/.env.example")) {
    $frontendEnvExample | Out-File -FilePath "frontend/fe-quanlikhachsan/.env.example" -Encoding UTF8
    Write-Host "✅ Tạo frontend/.env.example" -ForegroundColor Green
} else {
    Write-Host "ℹ️  frontend/.env.example đã tồn tại" -ForegroundColor Blue
}

# Frontend .env.local (cho development)
if (!(Test-Path "frontend/fe-quanlikhachsan/.env.local")) {
    "NEXT_PUBLIC_API_URL=http://localhost:5000/api" | Out-File -FilePath "frontend/fe-quanlikhachsan/.env.local" -Encoding UTF8
    Write-Host "✅ Tạo frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "ℹ️  frontend/.env.local đã tồn tại" -ForegroundColor Blue
}

# Kiểm tra các file quan trọng
Write-Host "`n🔍 Kiểm tra các file quan trọng..." -ForegroundColor Yellow

$requiredFiles = @(
    "frontend/fe-quanlikhachsan/package.json",
    "frontend/fe-quanlikhachsan/vercel.json",
    "backend/be-quanlikhachsanapi/Dockerfile",
    "backend/be-quanlikhachsanapi/.dockerignore",
    "backend/be-quanlikhachsanapi/be-quanlikhachsanapi.csproj"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - THIẾU!" -ForegroundColor Red
    }
}

# Test build local
Write-Host "`n🔨 Test build local..." -ForegroundColor Yellow

# Test frontend build
Write-Host "Testing frontend build..." -ForegroundColor Cyan
Set-Location "frontend/fe-quanlikhachsan"
try {
    npm install --silent
    npm run build --silent
    Write-Host "✅ Frontend build thành công" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend build thất bại!" -ForegroundColor Red
}
Set-Location "../.."

# Test backend build
Write-Host "Testing backend build..." -ForegroundColor Cyan
Set-Location "backend/be-quanlikhachsanapi"
try {
    dotnet restore --verbosity quiet
    dotnet build --verbosity quiet
    Write-Host "✅ Backend build thành công" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend build thất bại!" -ForegroundColor Red
}
Set-Location "../.."

# Hướng dẫn tiếp theo
Write-Host "`n📋 BƯỚC TIẾP THEO:" -ForegroundColor Yellow
Write-Host "1. Tạo repository trên GitHub" -ForegroundColor White
Write-Host "2. Push code lên GitHub:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Initial commit for deployment'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host "3. Đăng nhập Render.com và tạo Web Service" -ForegroundColor White
Write-Host "4. Đăng nhập Vercel.com và tạo Project" -ForegroundColor White
Write-Host "5. Xem DEPLOYMENT_GUIDE.md để biết chi tiết" -ForegroundColor White

Write-Host "`n🎉 Setup hoàn thành!" -ForegroundColor Green
