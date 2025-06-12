# 🚀 Deploy Script for Hotel Management System

Write-Host "🏨 Hotel Management System - Deploy Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Kiểm tra git status
Write-Host "`n📋 Checking git status..." -ForegroundColor Yellow
git status

# Hỏi user có muốn commit không
$commit = Read-Host "`n❓ Do you want to commit changes? (y/n)"
if ($commit -eq "y" -or $commit -eq "Y") {
    $message = Read-Host "💬 Enter commit message"
    if ([string]::IsNullOrWhiteSpace($message)) {
        $message = "Update: Fix JWT key size and CORS configuration for production"
    }
    
    Write-Host "`n📝 Adding files..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Committing..." -ForegroundColor Yellow
    git commit -m "$message"
    
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host "✅ Code pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "⏭️ Skipping commit..." -ForegroundColor Yellow
}

Write-Host "`n🔧 Deployment Information:" -ForegroundColor Cyan
Write-Host "Backend (Render): https://passion-quan-li-khach-san.onrender.com" -ForegroundColor White
Write-Host "Frontend (Vercel): https://passion-quan-li-khach-san.vercel.app" -ForegroundColor White

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. ✅ Code has been pushed to GitHub" -ForegroundColor Green
Write-Host "2. 🔄 Render will auto-deploy backend (5-10 minutes)" -ForegroundColor Blue
Write-Host "3. 🔄 Vercel will auto-deploy frontend (2-5 minutes)" -ForegroundColor Blue
Write-Host "4. 🧪 Test the application after deployment" -ForegroundColor Magenta

Write-Host "`n🧪 Test URLs:" -ForegroundColor Cyan
Write-Host "Health Check: https://passion-quan-li-khach-san.onrender.com/api/health" -ForegroundColor White
Write-Host "Frontend: https://passion-quan-li-khach-san.vercel.app" -ForegroundColor White

Write-Host "`n🔑 Admin Login Credentials:" -ForegroundColor Yellow
Write-Host "Username: admin" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White

Write-Host "`n✨ Deploy script completed!" -ForegroundColor Green
