using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace be_quanlikhachsanapi.Data;

[Table("ApDungKM")]
public partial class ApDungKm
{
    [Key]
    [StringLength(10)]
    [Column("MaApDung")]
    public string MaApDung { get; set; } = null!;

    [Required]
    [StringLength(10)]
    [Column("MaKM")]
    public string MaKm { get; set; } = null!;

    [Required]
    [StringLength(10)]
    public string MaDatPhong { get; set; } = null!;

    [Column(TypeName = "decimal(18, 2)")]
    public decimal SoTienGiam { get; set; }

    [ForeignKey("MaDatPhong")]
    public virtual DatPhong MaDatPhongNavigation { get; set; } = null!;

    [ForeignKey("MaKm")]
    public virtual KhuyenMai MaKmNavigation { get; set; } = null!;
}
