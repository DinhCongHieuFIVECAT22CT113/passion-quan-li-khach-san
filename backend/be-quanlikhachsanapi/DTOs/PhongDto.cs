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

        public int? Tang { get; set; } = default; // Cho phép null

    }

    public class UpdatePhongDTO
    {
        [Required(ErrorMessage = "Mã loại phòng là bắt buộc.")]
        public string MaLoaiPhong { get; set; } = default!;

        [Required(ErrorMessage = "Số phòng là bắt buộc.")]
        public string SoPhong { get; set; } = default!;

        public string? Thumbnail { get; set; } = default; // Cho phép null

        public string? HinhAnh { get; set; } = default; // Cho phép null

        public int? Tang { get; set; } = default; // Cho phép null

    }
}
