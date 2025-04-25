using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class PhanCongDTO
    {
        public string MaNv { get; set; } = default!;
        public string MaCaLam { get; set; } = default!;
        public DateOnly NgayLam { get; set; }
        
    }
    public class CreatePhanCongDTO
    {
        [Required (ErrorMessage = "Mã nhân viên là bắt buộc.")]
        public string MaNv { get; set; } = default!;
        [Required (ErrorMessage = "Mã ca làm là bắt buộc.")]
        public string MaCaLam { get; set; } = default!;
        [Required(ErrorMessage = "Ngày làm là bắt buộc.")]
        public DateOnly NgayLam { get; set; }
    }
    public class UpdatePhanCongDTO
    {
        [Required (ErrorMessage = "Mã nhân viên là bắt buộc.")]
        public string MaNv { get; set; } = default!;
        [Required (ErrorMessage = "Mã ca làm là bắt buộc.")]
        public string MaCaLam { get; set; } = default!;
        [Required(ErrorMessage = "Ngày làm là bắt buộc.")]
        public DateOnly NgayLam { get; set; }
    }
}