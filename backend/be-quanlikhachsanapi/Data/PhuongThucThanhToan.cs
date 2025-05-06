using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace be_quanlikhachsanapi.Data;

[Table("PhuongThucThanhToan")]
public partial class PhuongThucThanhToan
{
    [Key]
    [StringLength(10)]
    [Column("MaPhuongThucThanhToan")]
    public string MaPhuongThucThanhToan { get; set; } = null!;

    [Required]
    [StringLength(10)]
    [Column("MaHoaDon")]
    public string MaHoaDon { get; set; } = null!;

    [Required]
    [Column(TypeName = "decimal(18, 2)")]
    public decimal SoTienCanThanhToan { get; set; }

    [Required]
    [StringLength(150)]
    [Column("PhuongThucThanhToan")]
    public string PhuongThucThanhToan1 { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string TrangThai { get; set; } = null!;

    public DateTime? NgayThanhToan { get; set; }

    public DateTime? NgayTao { get; set; }

    public DateTime? NgaySua { get; set; }

    [ForeignKey("MaHoaDon")]
    public virtual HoaDon MaHoaDonNavigation { get; set; } = null!;
}
