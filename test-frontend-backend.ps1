# Script test kết nối Frontend - Backend
Write-Host "🔗 KIỂM TRA KẾT NỐI FRONTEND - BACKEND" -ForegroundColor Yellow

$backendUrl = "https://passion-quan-li-khach-san.onrender.com"
$frontendUrl = "https://passion-quan-li-khach-san-git-main-conghieus-projects.vercel.app"

Write-Host "`n1. Kiểm tra Backend API..." -ForegroundColor Cyan
try {
    $backendResponse = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method GET -TimeoutSec 30
    Write-Host "✅ Backend API hoạt động" -ForegroundColor Green
    Write-Host "Response: $($backendResponse | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend API lỗi: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "⚠️ Đảm bảo backend đã được deploy thành công" -ForegroundColor Yellow
}

Write-Host "`n2. Kiểm tra Frontend..." -ForegroundColor Cyan
try {
    $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 30
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend hoạt động" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Frontend trả về status: $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Test CORS từ Frontend domain..." -ForegroundColor Cyan
$corsHeaders = @{
    'Origin' = $frontendUrl
    'Access-Control-Request-Method' = 'GET'
    'Access-Control-Request-Headers' = 'Content-Type,Authorization'
}

try {
    $corsResponse = Invoke-WebRequest -Uri "$backendUrl/api/health" -Method OPTIONS -Headers $corsHeaders -TimeoutSec 30
    $allowOrigin = $corsResponse.Headers['Access-Control-Allow-Origin']
    if ($allowOrigin -and ($allowOrigin -eq $frontendUrl -or $allowOrigin -eq '*')) {
        Write-Host "✅ CORS được cấu hình đúng cho frontend" -ForegroundColor Green
    } else {
        Write-Host "⚠️ CORS có thể chưa được cấu hình đúng" -ForegroundColor Yellow
        Write-Host "Allow-Origin: $allowOrigin" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ CORS test lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Test API endpoint cụ thể..." -ForegroundColor Cyan
$testEndpoints = @(
    "/api/health",
    "/api/LoaiPhong",
    "/api/Phong"
)

foreach ($endpoint in $testEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$backendUrl$endpoint" -Method GET -TimeoutSec 15
        Write-Host "✅ $endpoint hoạt động" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "🔐 $endpoint cần authentication (401) - Bình thường" -ForegroundColor Yellow
        } else {
            Write-Host "❌ $endpoint lỗi: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n📋 HƯỚNG DẪN TIẾP THEO:" -ForegroundColor Yellow
Write-Host "1. Nếu Backend lỗi:" -ForegroundColor White
Write-Host "   - Kiểm tra Render Dashboard logs" -ForegroundColor Gray
Write-Host "   - Đảm bảo service đang chạy" -ForegroundColor Gray

Write-Host "2. Nếu Frontend lỗi:" -ForegroundColor White
Write-Host "   - Kiểm tra Vercel Dashboard" -ForegroundColor Gray
Write-Host "   - Đảm bảo environment variables đã được set" -ForegroundColor Gray

Write-Host "3. Nếu CORS lỗi:" -ForegroundColor White
Write-Host "   - Cập nhật AllowedOrigins trong backend" -ForegroundColor Gray
Write-Host "   - Redeploy backend" -ForegroundColor Gray

Write-Host "`n🔗 LINKS QUAN TRỌNG:" -ForegroundColor Yellow
Write-Host "- Backend: $backendUrl" -ForegroundColor White
Write-Host "- Backend Health: $backendUrl/api/health" -ForegroundColor White
Write-Host "- Backend Swagger: $backendUrl/swagger" -ForegroundColor White
Write-Host "- Frontend: $frontendUrl" -ForegroundColor White
