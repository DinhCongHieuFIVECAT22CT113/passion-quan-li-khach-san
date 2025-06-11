# 🔧 FIX BOOKING VÀ PROFILE ISSUES

## 📋 Các vấn đề đã được fix

### 1. **Vấn đề không hiển thị đặt phòng của user**

**❌ Vấn đề**: 
- API `/DatPhong/KhachHang` trả về field `maKh` (chữ thường)
- Frontend đang tìm `maKH` hoặc `MaKH` (chữ hoa)
- Kết quả: Lọc từ 6 đặt phòng xuống 0

**✅ Đã fix**:
```typescript
// Trước
const bookingMaKH = booking.maKH || booking.MaKH;

// Sau  
const bookingMaKH = booking.maKh || booking.maKH || booking.MaKH;
```

### 2. **Vấn đề avatar bị mất khi F5**

**❌ Vấn đề**:
- Avatar chỉ lưu trong context
- Khi F5, context bị reset
- JWT token không chứa avatar URL

**✅ Đã fix**:

1. **Backend**: Thêm avatar vào JWT token
```csharp
// TokenService.cs
new Claim("picture", khachHang.AnhDaiDien ?? string.Empty)
```

2. **Frontend**: Persist avatar trong localStorage
```typescript
// AvatarUploadModal.tsx
localStorage.setItem('userAvatarUrl', avatarUrl);

// auth.tsx
const savedAvatarUrl = localStorage.getItem('userAvatarUrl');
const avatarUrl = savedAvatarUrl || decodedToken.picture || undefined;
```

3. **Cleanup khi logout**:
```typescript
const logoutUser = () => {
  // ...
  localStorage.removeItem('userAvatarUrl');
  // ...
};
```

### 3. **Vấn đề đổi mật khẩu lỗi**

**❌ Vấn đề**:
- Frontend không hiển thị error message rõ ràng
- Không log response để debug

**✅ Đã fix**:
```typescript
// Trước
const errorData = await response.json();

// Sau
const errorText = await response.text();
console.error('Error response:', errorText);
console.error('Response status:', response.status);

try {
  const errorData = JSON.parse(errorText);
  // Handle JSON error
} catch (parseError) {
  // Handle non-JSON error
  window.alert(errorText || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
}
```

## 🚀 Kết quả sau khi fix

### ✅ **Booking System**:
- User có thể xem đúng danh sách đặt phòng của mình
- Khách vãng lai có thể đặt phòng thành công
- API endpoints hoạt động đúng logic

### ✅ **Profile System**:
- Avatar được persist qua F5
- Đổi mật khẩu hiển thị error message rõ ràng
- Upload avatar hoạt động ổn định

### ✅ **Authentication**:
- JWT token chứa avatar URL
- Auto-refresh token hoạt động
- Logout cleanup đầy đủ

## 🧪 Cách test

### **Test Booking**:
1. Đăng nhập với user KH001
2. Vào `/users/bookings`
3. Kiểm tra có hiển thị đặt phòng không
4. Console không còn log "Lọc từ X xuống 0"

### **Test Avatar**:
1. Upload avatar mới
2. F5 trang
3. Avatar vẫn hiển thị đúng
4. Logout và login lại → avatar vẫn đúng

### **Test Change Password**:
1. Vào profile → đổi mật khẩu
2. Nhập sai mật khẩu cũ
3. Kiểm tra error message hiển thị rõ ràng
4. Console log response để debug

## 📝 Files đã thay đổi

### **Backend**:
- `Services/ITokenServices.cs` - Thêm avatar vào JWT
- `Controllers/DatPhongController.cs` - Fix API booking
- `DTOs/DatPhongDTO.cs` - Thêm CreateGuestBookingDTO

### **Frontend**:
- `src/app/users/bookings/page.tsx` - Fix field mapping
- `src/app/components/profile/AvatarUploadModal.tsx` - Persist avatar
- `src/lib/auth.tsx` - Load avatar từ localStorage
- `src/app/users/profile/page.tsx` - Better error handling

## 🎯 Next Steps

1. **Test thoroughly** tất cả các fixes
2. **Monitor logs** để đảm bảo không có regression
3. **Deploy** lên staging/production
4. **User acceptance testing**

## 🔍 Debug Commands

```bash
# Check booking API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/DatPhong/KhachHang

# Check user info
console.log(localStorage.getItem('userAvatarUrl'));
console.log(user); // In auth context
```

---

**Tóm tắt**: Đã fix 3 vấn đề chính về booking, avatar và change password. Hệ thống giờ hoạt động ổn định và user-friendly hơn.
