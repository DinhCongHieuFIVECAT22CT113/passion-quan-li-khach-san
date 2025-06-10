using System;
using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.Models
{
    public class PendingGuestBooking
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string HoTen { get; set; }
        
        [Required(ErrorMessage = "Email là bắt buộc")]
        public string Email { get; set; }
        
        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        public string SoDienThoai { get; set; }
        
        [Required(ErrorMessage = "Mã phòng là bắt buộc")]
        public string MaPhong { get; set; }
        
        [Required(ErrorMessage = "Ngày nhận phòng là bắt buộc")]
        public string NgayNhanPhong { get; set; }
        
        [Required(ErrorMessage = "Ngày trả phòng là bắt buộc")]
        public string NgayTraPhong { get; set; }
        
        public int SoNguoiLon { get; set; } = 1;
        public int SoTreEm { get; set; } = 0;
        public string? GhiChu { get; set; }
        public string? ThoiGianDen { get; set; } = "14:00";
        
        // Những trường này sẽ được tạo bởi server, không yêu cầu từ client
        public string? MaXacNhan { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool Confirmed { get; set; } = false;
    }
}
