using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace be_quanlikhachsanapi.Data;

[Table("HoaDon")]
public partial class HoaDon
{
    [Key]
    [StringLength(10)]
    [Column("MaHoaDon")]
    public string MaHoaDon { get; set; } = null!;

    [Required]
    [StringLength(10)]
    [Column("MaDatPhong")]
    public string MaDatPhong { get; set; } = null!;

    [StringLength(10)]
    [Column("MaKM")]
    public string? MaKm { get; set; }

    [Column("GiamGiaLoaiKM", TypeName = "decimal(18, 2)")]
    public decimal? GiamGiaLoaiKm { get; set; }

    [Column("GiamGiaLoaiKH", TypeName = "decimal(18, 2)")]
    public decimal? GiamGiaLoaiKh { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TongTien { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? SoTienDaThanhToan { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? SoTienConThieu { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? SoTienThanhToanDu { get; set; }

    [Required]
    [StringLength(50)]
    public string TrangThai { get; set; } = "Chưa thanh toán";

    [Column(TypeName = "datetime2(7)")]
    public DateTime? NgayTao { get; set; }

    [Column(TypeName = "datetime2(7)")]
    public DateTime? NgaySua { get; set; }

    [ForeignKey("MaDatPhong")]
    public virtual DatPhong MaDatPhongNavigation { get; set; } = null!;

    [ForeignKey("MaKm")]
    public virtual KhuyenMai? MaKmNavigation { get; set; }

    public virtual ICollection<PhuongThucThanhToan> PhuongThucThanhToans { get; set; } = new List<PhuongThucThanhToan>();
}
