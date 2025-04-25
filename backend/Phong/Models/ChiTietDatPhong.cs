using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLKS.Models
{
    public class ChiTietDatPhong
    {
        [Key]
        [Required(ErrorMessage = "Mã chi tiết đặt phòng là bắt buộc")]
        [StringLength(10)]
        public string MaChiTietDatPhong { get; set; }

        [Required(ErrorMessage = "Mã đặt phòng là bắt buộc")]
        [StringLength(10)]
        public string MaDatPhong { get; set; }

        [Required(ErrorMessage = "Mã loại phòng là bắt buộc")]
        [StringLength(10)]
        public string MaLoaiPhong { get; set; }

        [Required(ErrorMessage = "Mã phòng là bắt buộc")]
        [StringLength(10)]
        public string MaPhong { get; set; }

        [Required(ErrorMessage = "Số đêm là bắt buộc")]
        [Range(1, 30, ErrorMessage = "Số đêm phải từ 1 đến 30")]
        public int SoDem { get; set; }

        [Required(ErrorMessage = "Giá tiền là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Giá tiền phải lớn hơn 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal GiaTien { get; set; }

        [Required(ErrorMessage = "Thành tiền là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Thành tiền phải lớn hơn 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ThanhTien { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        [StringLength(50)]
        public string TrangThai { get; set; }

        // Navigation properties
        public DatPhong DatPhong { get; set; }
        public LoaiPhong LoaiPhong { get; set; }
        public Phong Phong { get; set; }
    }
} 