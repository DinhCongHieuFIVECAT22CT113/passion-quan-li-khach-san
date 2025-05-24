using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class LoaiPhongDTO
    {
        public string MaLoaiPhong { get; set; } = default!;

        public string TenLoaiPhong { get; set; } = default!;

        public string? MoTa { get; set; }

        public decimal GiaMoiGio { get; set; }

        public decimal GiaMoiDem { get; set; }

        public int SoPhongTam { get; set; }

        public int SoGiuongNgu { get; set; }

        public int? GiuongDoi { get; set; }

        public int? GiuongDon { get; set; }

        public int KichThuocPhong { get; set; }

        public int SucChua { get; set; }

        public string? Thumbnail { get; set; }

    }

    public class CreateLoaiPhongDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenLoaiPhong { get; set; } = default!;

        public string? MoTa { get; set; }

        [Range(0, double.MaxValue)]
        public decimal GiaMoiGio { get; set; }

        [Range(0, double.MaxValue)]
        public decimal GiaMoiDem { get; set; }

        [Range(0, int.MaxValue)]
        public int SoPhongTam { get; set; }

        [Range(0, int.MaxValue)]
        public int SoGiuongNgu { get; set; }

        [Range(0, int.MaxValue)]
        public int? GiuongDoi { get; set; }

        [Range(0, int.MaxValue)]
        public int? GiuongDon { get; set; }

        [Range(0, int.MaxValue)]
        public int KichThuocPhong { get; set; }

        [Range(0, int.MaxValue)]
        public int SucChua { get; set; }

        public string? Thumbnail { get; set; }

    }
    public class UpdateLoaiPhongDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenLoaiPhong { get; set; } = default!;

        public string? MoTa { get; set; }

        [Range(0, double.MaxValue)]
        public decimal GiaMoiGio { get; set; }

        [Range(0, double.MaxValue)]
        public decimal GiaMoiDem { get; set; }

        [Range(0, int.MaxValue)]
        public int SoPhongTam { get; set; }

        [Range(0, int.MaxValue)]
        public int SoGiuongNgu { get; set; }

        [Range(0, int.MaxValue)]
        public int? GiuongDoi { get; set; }

        [Range(0, int.MaxValue)]
        public int? GiuongDon { get; set; }

        [Range(0, int.MaxValue)]
        public int KichThuocPhong { get; set; }

        [Range(0, int.MaxValue)]
        public int SucChua { get; set; }

        public string? Thumbnail { get; set; }

    }

}