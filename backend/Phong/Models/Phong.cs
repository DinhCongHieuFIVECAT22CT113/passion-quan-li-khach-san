using System.ComponentModel.DataAnnotations;

namespace QLKS.Models
{
    public class Phong
    {
        [Key]
        [Required(ErrorMessage = "Mã phòng là bắt buộc")]
        [StringLength(10)]
        public string MaPhong { get; set; }

        [Required(ErrorMessage = "Mã loại phòng là bắt buộc")]
        [StringLength(10)]
        public string MaLoaiPhong { get; set; }

        [Required(ErrorMessage = "Số phòng là bắt buộc")]
        [StringLength(10)]
        public string SoPhong { get; set; }

        public string? Thumbnail { get; set; }

        public string? HinhAnh { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        [StringLength(50)]
        public string TrangThai { get; set; }

        [Required(ErrorMessage = "Tầng là bắt buộc")]
        [Range(1, 100, ErrorMessage = "Tầng phải từ 1 đến 100")]
        public int Tang { get; set; }

        public DateTime NgayTao { get; set; } = DateTime.Now;

        public DateTime NgaySua { get; set; } = DateTime.Now;

        // Navigation property
        public LoaiPhong LoaiPhong { get; set; }
    }
} 