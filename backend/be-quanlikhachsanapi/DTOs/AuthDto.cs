using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "UserName là bắt buộc")]
        public string UserName { get; set; } = default!;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; } = default!;

        [Required(ErrorMessage = "Xác nhận mật khẩu là bắt buộc")]
        [Compare("Password", ErrorMessage = "Mật khẩu và xác nhận mật khẩu không khớp.")]
        public string ConfirmPassword { get; set; } = default!;

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = default!;

        [Required(ErrorMessage = "Họ KH là bắt buộc")]
        public string HoKh { get; set; } = default!;

        [Required(ErrorMessage = "Tên KH là bắt buộc")]
        public string TenKh { get; set; } = default!;

        [Required(ErrorMessage = "Số CCCD là bắt buộc")]
        public string SoCccd { get; set; } = default!;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        public string SoDienThoai { get; set; } = default!;
    }

    public class LoginDto
    {
        [Required(ErrorMessage = "UserName là bắt buộc")]
        public string UserName { get; set; } = default!;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; } = default!;
    }
    public class ChangePassDto
    {   
        [Required]
        public required string Password { get; set; }

        [Required]
        public required string NewPassword { get; set; }

        [Required]
        public required string ConfirmPassword { get; set; }
    }
    public class ResetPassDto
    {
        public string UserName { get; set; } = default!;
    }

    public class UserDto
    {
        public string MaNguoiDung { get; set; } = default!;
        public string UserName { get; set; } = default!;
        public string HoTen { get; set; } = default!;
        public string Token { get; set; } = default!;
        public string RefreshToken { get; set; } = default!;
        public string MaRole { get; set; } = default!;
    }

    public class RefreshTokenDto
    {
        [Required(ErrorMessage = "Refresh token là bắt buộc")]
        public string RefreshToken { get; set; } = default!;
        
        [Required(ErrorMessage = "User ID là bắt buộc")]
        public string UserId { get; set; } = default!;
        
        [Required(ErrorMessage = "User type là bắt buộc")]
        public string UserType { get; set; } = default!; // "KhachHang" hoặc "NhanVien"
    }
}
