using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class KhuyenMaiDTO
    {
        public string MaKm { get; set; } = default!;

        public string TenKhuyenMai { get; set; } = default!;
        public string? Thumbnail { get; set; }
        public string MoTa { get; set; } = default!;
        public string MaGiamGia { get; set; } = default!;
        public int PhanTramGiam { get; set; }
        public decimal SoTienGiam { get; set; }

        public DateTime NgayBatDau { get; set; }

        public DateTime NgayKetThuc { get; set; }
        public string TrangThai { get; set; } = default!;
    }

    public class CreateKhuyenMaiDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenKhuyenMai { get; set; } = default!;
        [Required(ErrorMessage = "Hình ảnh là bắt buộc.")]
        [MaxLength(500)]
        public string? Thumbnail { get; set; }
        [Required]
        [MaxLength(500)]
        public string MoTa { get; set; } = default!;
        [Required]
        [MaxLength(50)]
        public string MaGiamGia { get; set; } = default!;
        [Required(ErrorMessage = "Phần trăm giảm giá là bắt buộc.")]
        [Range(0, 100, ErrorMessage = "Phần trăm giảm giá phải nằm trong khoảng từ 0 đến 100.")]
        public int PhanTramGiam { get; set; }
        [Required(ErrorMessage = "Số tiền giảm là bắt buộc.")]
        public decimal SoTienGiam { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc.")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime NgayBatDau { get; set; }
        [Required(ErrorMessage = "Ngày kết thúc là bắt buộc.")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime NgayKetThuc { get; set; }
        [Required(ErrorMessage = "Trạng thái là bắt buộc.")]
        [MaxLength(50)]
        public string TrangThai { get; set; } = default!;
    }

    public class UpdateKhuyenMaiDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenKhuyenMai { get; set; } = default!;
        [Required(ErrorMessage = "Hình ảnh là bắt buộc.")]
        [MaxLength(500)]
        public string? Thumbnail { get; set; }
        [Required]
        [MaxLength(500)]
        public string MoTa { get; set; } = default!;
        [Required]
        [MaxLength(50)]
        public string MaGiamGia { get; set; } = default!;
        [Required(ErrorMessage = "Phần trăm giảm là bắt buộc.")]
        public int PhanTramGiam { get; set; }
        [Required(ErrorMessage = "Số tiền giảm là bắt buộc.")]
        public decimal SoTienGiam { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc.")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime NgayBatDau { get; set; }

        [Required(ErrorMessage = "Ngày kết thúc là bắt buộc.")]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime NgayKetThuc { get; set; }   
        [Required(ErrorMessage = "Trạng thái là bắt buộc.")]
        [MaxLength(50)] 
        public string TrangThai { get; set; } = default!;
    }
}