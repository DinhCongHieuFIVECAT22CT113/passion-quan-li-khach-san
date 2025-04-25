using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLKS.Models
{
    public class LoaiPhong
    {
        [Key]
        [Required(ErrorMessage = "Mã loại phòng là bắt buộc")]
        [StringLength(10)]
        public string MaLoaiPhong { get; set; }

        [Required(ErrorMessage = "Tên loại phòng là bắt buộc")]
        [StringLength(150)]
        public string TenLoaiPhong { get; set; }

        public string? MoTa { get; set; }

        [Required(ErrorMessage = "Giá mỗi giờ là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Giá mỗi giờ phải lớn hơn 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal GiaMoiGio { get; set; }

        [Required(ErrorMessage = "Giá mỗi đêm là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Giá mỗi đêm phải lớn hơn 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal GiaMoiDem { get; set; }

        [Required(ErrorMessage = "Số phòng tắm là bắt buộc")]
        [Range(0, 10, ErrorMessage = "Số phòng tắm phải từ 0 đến 10")]
        public int SoPhongTam { get; set; }

        [Required(ErrorMessage = "Số giường ngủ là bắt buộc")]
        [Range(0, 10, ErrorMessage = "Số giường ngủ phải từ 0 đến 10")]
        public int SoGiuongNgu { get; set; }

        [Required(ErrorMessage = "Số giường đôi là bắt buộc")]
        [Range(0, 5, ErrorMessage = "Số giường đôi phải từ 0 đến 5")]
        public int GiuongDoi { get; set; }

        [Required(ErrorMessage = "Số giường đơn là bắt buộc")]
        [Range(0, 5, ErrorMessage = "Số giường đơn phải từ 0 đến 5")]
        public int GiuongDon { get; set; }

        [Required(ErrorMessage = "Kích thước phòng là bắt buộc")]
        [Range(10, 100, ErrorMessage = "Kích thước phòng phải từ 10 đến 100 m2")]
        public int KichThuocPhong { get; set; }

        [Required(ErrorMessage = "Sức chứa là bắt buộc")]
        [Range(1, 10, ErrorMessage = "Sức chứa phải từ 1 đến 10 người")]
        public int SucChua { get; set; }

        public string? Thumbnail { get; set; }

        public string? HinhAnh { get; set; }

        public DateTime NgayTao { get; set; } = DateTime.Now;

        public DateTime NgaySua { get; set; } = DateTime.Now;

        // Navigation property
        public ICollection<Phong> Phongs { get; set; }
    }
} 