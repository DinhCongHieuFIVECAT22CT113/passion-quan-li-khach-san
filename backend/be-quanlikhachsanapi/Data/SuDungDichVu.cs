using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace be_quanlikhachsanapi.Data
{
    [Table("SuDungDichVu")]
    public partial class SuDungDichVu
    {
        [Key]
        [StringLength(10)]
        public string MaSuDung { get; set; } = null!;

        [StringLength(10)]
        public string? MaDatPhong { get; set; }

        [StringLength(10)]
        public string? MaDichVu { get; set; }

        public int? SoLuong { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? TongTien { get; set; }

        [Column(TypeName = "datetime2(7)")]
        public DateTime? NgaySuDung { get; set; }

        [Timestamp]
        public byte[]? ThoiGianSuDung { get; set; }

        [StringLength(50)]
        public string? TrangThai { get; set; }

        [ForeignKey("MaDatPhong")]
        public virtual DatPhong? MaDatPhongNavigation { get; set; }

        [ForeignKey("MaDichVu")]
        public virtual DichVu? MaDichVuNavigation { get; set; }
    }
}
