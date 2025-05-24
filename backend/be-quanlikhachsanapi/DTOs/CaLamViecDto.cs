using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class CaLamViecDTO
    {
        public string MaCaLam { get; set; } = default!;

        public string TenCaLam { get; set; } = default!;

        public TimeOnly GioBatDau { get; set; }

        public TimeOnly GioKetThuc { get; set; }
    }

    public class CreateCaLamViecDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenCaLam { get; set; } = default!;
        [Required(ErrorMessage = "Giờ bắt đầu là bắt buộc.")]
        [DataType(DataType.Time)]
        [DisplayFormat(DataFormatString = "{0:HH:mm}", ApplyFormatInEditMode = true)]
        public TimeOnly GioBatDau { get; set; }
        [Required(ErrorMessage = "Giờ kết thúc là bắt buộc.")]
        [DataType(DataType.Time)]
        [DisplayFormat(DataFormatString = "{0:HH:mm}", ApplyFormatInEditMode = true)]
        public TimeOnly GioKetThuc { get; set; }
    }

    public class UpdateCaLamViecDTO
    {
        [Required]
        [MaxLength(100)]
        public string TenCaLam { get; set; } = default!;
        [Required(ErrorMessage = "Giờ bắt đầu là bắt buộc.")]
        [DataType(DataType.Time)]
        [DisplayFormat(DataFormatString = "{0:HH:mm}", ApplyFormatInEditMode = true)]
        public TimeOnly GioBatDau { get; set; }
        [Required(ErrorMessage = "Giờ kết thúc là bắt buộc.")]
        [DataType(DataType.Time)]
        [DisplayFormat(DataFormatString = "{0:HH:mm}", ApplyFormatInEditMode = true)]
        public TimeOnly GioKetThuc { get; set; }
    }
}