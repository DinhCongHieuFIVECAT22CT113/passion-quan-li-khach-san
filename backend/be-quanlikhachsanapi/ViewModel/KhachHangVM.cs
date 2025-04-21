    using System.ComponentModel.DataAnnotations;
using be_quanlikhachsanapi.Data;
using Microsoft.Identity.Client;

namespace be_quanlikhachsanapi.ViewModel
{
    public class KhachHangVM
    {
        public string? UserName { get; set; }

        public string? PasswordHash { get; set; }

        public string? HoKh { get; set; }

        public string? TenKh { get; set; }

        public string? Email { get; set; }

        public string? Sdt { get; set; }

        public string? DiaChi { get; set; }

        public string? SoCccd { get; set; }

        public DateTime? NgayTao { get; set; }

        public DateTime? NgaySua { get; set; }

        public string? MaLoaiKh { get; set; }

        public virtual LoaiKhachHang? MaLoaiKhNavigation { get; set; }
        public virtual Role? MaRoleNavigation { get; set; }

    }

    public class KhachHangMD : KhachHangVM
    {
        public string? MaKh { get; set; }
        public virtual ICollection<DatPhong> DatPhongs { get; set; } = new List<DatPhong>();

    }
    public class RegisterVM
    {
        [Required]
        [StringLength(50)]
        public required string Username { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public required string Password { get; set; }
        [Required]
        public required string RePassword { get; set; }
        public string? HoKh { get; set; }
        public string? TenKh { get; set; }
        public string? SoCccd { get; set; }
        public string? Sdt { get; set; }
        public DateTime? NgayTao { get; set; }
    }
    
    public class LoginVM
    {
        [Required]
        public required string UserName { get; set; }
        [Required]
        public required string Password { get; set; }    
    }
    public class UpdateKH
    {
        public string? Sdt { get; set; }
        public string? DiaChi { get; set; }
        public string? MaLoaiKh { get; set;}
    }
    public class AddKH
    {
        public string? MaKh { get; set; }
        public string? UserName { get; set; }
        public string? HoKh { get; set; }
        public string? TenKh { get; set; }
        public string? Email { get; set; }
        public string? Sdt { get; set; }
        public string? SoCccd { get; set; }
        public string? MaLoaiKh { get; set; }
        public DateTime? NgayTao { get; set; }
    }
    public class ChangePassVM
    {
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public required string Password { get; set; }
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public required string NewPassword { get; set; }
        public required string RePassword { get; set; }
    }
}