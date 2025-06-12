# Script kiểm tra deployment
Write-Host "🔍 KIỂM TRA DEPLOYMENT BACKEND" -ForegroundColor Yellow

$baseUrl = "https://passion-quan-li-khach-san.onrender.com"

Write-Host "`n1. Kiểm tra endpoint chính..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method GET -TimeoutSec 30
    Write-Host "✅ Endpoint chính hoạt động" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Endpoint chính lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Kiểm tra health check..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET -TimeoutSec 30
    Write-Host "✅ Health check hoạt động" -ForegroundColor Green
    Write-Host "Response: $($healthResponse | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Kiểm tra Swagger UI..." -ForegroundColor Cyan
try {
    $swaggerResponse = Invoke-WebRequest -Uri "$baseUrl/swagger" -Method GET -TimeoutSec 30
    if ($swaggerResponse.StatusCode -eq 200) {
        Write-Host "✅ Swagger UI hoạt động" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Swagger UI trả về status: $($swaggerResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Swagger UI lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Test CORS..." -ForegroundColor Cyan
$corsHeaders = @{
    'Origin' = 'https://passion-quan-li-khach-san-git-main-conghieus-projects.vercel.app'
    'Access-Control-Request-Method' = 'GET'
    'Access-Control-Request-Headers' = 'Content-Type'
}

try {
    $corsResponse = Invoke-WebRequest -Uri $baseUrl -Method OPTIONS -Headers $corsHeaders -TimeoutSec 30
    if ($corsResponse.Headers['Access-Control-Allow-Origin']) {
        Write-Host "✅ CORS được cấu hình đúng" -ForegroundColor Green
    } else {
        Write-Host "⚠️ CORS có thể chưa được cấu hình đúng" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ CORS test lỗi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 KẾT QUẢ TỔNG QUAN:" -ForegroundColor Yellow
Write-Host "- Truy cập trực tiếp: $baseUrl" -ForegroundColor White
Write-Host "- Health check: $baseUrl/api/health" -ForegroundColor White
Write-Host "- Swagger UI: $baseUrl/swagger" -ForegroundColor White

Write-Host "`n🔧 NẾU VẪN LỖI:" -ForegroundColor Yellow
Write-Host "1. Kiểm tra Render Dashboard logs" -ForegroundColor White
Write-Host "2. Đảm bảo đã commit và push code mới" -ForegroundColor White
Write-Host "3. Thực hiện Manual Deploy trên Render" -ForegroundColor White
Write-Host "4. Chờ 2-3 phút để service khởi động hoàn toàn" -ForegroundColor White
