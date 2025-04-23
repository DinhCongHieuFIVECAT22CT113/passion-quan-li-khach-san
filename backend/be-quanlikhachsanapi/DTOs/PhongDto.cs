using System.ComponentModel.DataAnnotations;

namespace be_quanlikhachsanapi.DTOs
{
    public class PhongDTO
    {
        public string MaPhong { get; set; } = default!;  // ID của phòng
        public string MaLoaiPhong { get; set; } = default!;  // Mã loại phòng
        public string SoPhong { get; set; } = default!;  // Số phòng
        public string? Thumbnail { get; set; }  // Hình thu nhỏ của phòng
        public string? HinhAnh { get; set; }  // Hình ảnh phòng
        public string TrangThai { get; set; } = default!;  // Trạng thái phòng
        public int? Tang { get; set; }  // Tầng phòng
    }

    public class CreatePhongDTO
    {
        [Required(ErrorMessage = "Mã loại phòng là bắt buộc.")]
        public string MaLoaiPhong { get; set; } = default!;

        [Required(ErrorMessage = "Số phòng là bắt buộc.")]
        public string SoPhong { get; set; } = default!;

        public string? Thumbnail { get; set; } = default; // Cho phép null

        public string? HinhAnh { get; set; } = default; // Cho phép null

        [Required(ErrorMessage = "Trạng thái phòng là bắt buộc.")]
        public string TrangThai { get; set; } = default!;

        public int? Tang { get; set; } = default; // Cho phép null

        [Required(ErrorMessage = "Ngày tạo phòng là bắt buộc.")]
        [DataType(DataType.DateTime, ErrorMessage = "Ngày tạo không hợp lệ.")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime NgayTao { get; set; } = default; // DateTime.MinValue

        public DateTime? NgaySua { get; set; } = default; // Cho phép null
    }

    public class UpdatePhongDTO
    {
        [Required(ErrorMessage = "Mã loại phòng là bắt buộc.")]
        public string MaLoaiPhong { get; set; } = default!;

        [Required(ErrorMessage = "Số phòng là bắt buộc.")]
        public string SoPhong { get; set; } = default!;

        public string? Thumbnail { get; set; } = default; // Cho phép null

        public string? HinhAnh { get; set; } = default; // Cho phép null

        [Required(ErrorMessage = "Trạng thái phòng là bắt buộc.")]
        public string TrangThai { get; set; } = default!;

        public int? Tang { get; set; } = default; // Cho phép null

        [Required(ErrorMessage = "Ngày sửa phòng là bắt buộc.")]
        [DataType(DataType.DateTime, ErrorMessage = "Ngày sửa không hợp lệ.")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? NgaySua { get; set; } = default; // Cho phép null
    }
}
