using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class KhachHangDto
    {
        public string MaKh { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string HoKh { get; set; } = null!;
        public string TenKh { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Sdt { get; set; } = null!;
        public string? DiaChi { get; set; }
        public string SoCccd { get; set; } = null!;
        public string? MaLoaiKh { get; set; }
        public string? MaRole { get; set; }
        public DateTime? NgayTao { get; set; }
        public DateTime? NgaySua { get; set; }
    }

    public class CreateKhachHangDto
    {
        public string UserName { get; set; } = null!;
        public string HoKh { get; set; } = null!;
        public string TenKh { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Sdt { get; set; } = null!;
        public string? DiaChi { get; set; }
        public string SoCccd { get; set; } = null!;
        public DateTime? NgayTao { get; set; }
    }

    public class UpdateKhachHangDto
    {
        public string Email { get; set; } = null!;
        public string Sdt { get; set; } = null!;
        public string? DiaChi { get; set; }
        public string SoCccd { get; set; } = null!;
        public string? MaLoaiKh { get; set; }
    }
    // public class ChangePassDto
    // {
    //     [Required]
    //     public required string Password { get; set; }

    //     [Required]
    //     public required string NewPassword { get; set; }

    //     [Required]
    //     public required string ConfirmPassword { get; set; }
    // }
}