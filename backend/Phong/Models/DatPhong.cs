using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLKS.Models
{
    public class DatPhong
    {
        [Key]
        [Required(ErrorMessage = "Mã đặt phòng là bắt buộc")]
        [StringLength(10)]
        public string MaDatPhong { get; set; }

        [Required(ErrorMessage = "Mã khách hàng là bắt buộc")]
        [StringLength(10)]
        public string MaKH { get; set; }

        [Required(ErrorMessage = "Số trẻ em là bắt buộc")]
        [Range(0, 10, ErrorMessage = "Số trẻ em phải từ 0 đến 10")]
        public int TreEm { get; set; }

        [Required(ErrorMessage = "Số người lớn là bắt buộc")]
        [Range(1, 10, ErrorMessage = "Số người lớn phải từ 1 đến 10")]
        public int NguoiLon { get; set; }

        public string? GhiChu { get; set; }

        [Required(ErrorMessage = "Số lượng phòng là bắt buộc")]
        [Range(1, 10, ErrorMessage = "Số lượng phòng phải từ 1 đến 10")]
        public int SoLuongPhong { get; set; }

        [Required(ErrorMessage = "Thời gian đến là bắt buộc")]
        [StringLength(255)]
        public string ThoiGianDen { get; set; }

        public DateTime? NgayNhanPhong { get; set; }

        public DateTime? NgayTraPhong { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        [StringLength(50)]
        public string TrangThai { get; set; }

        public DateTime NgayTao { get; set; } = DateTime.Now;

        public DateTime NgaySua { get; set; } = DateTime.Now;

        [Required(ErrorMessage = "Giá gốc là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Giá gốc phải lớn hơn 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal GiaGoc { get; set; }

        [Required(ErrorMessage = "Tổng tiền là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Tổng tiền phải lớn hơn 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TongTien { get; set; }

        // Navigation properties
        public ICollection<ChiTietDatPhong> ChiTietDatPhongs { get; set; }
    }
} 