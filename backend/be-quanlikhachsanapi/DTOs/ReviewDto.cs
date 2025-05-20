namespace be_quanlikhachsanapi.DTOs
{
    public class ReviewDto
    {
        public string MaReview { get; set; } = null!;
        public string MaDatPhong { get; set; } = null!;
        public int DanhGia { get; set; }
        public string BinhLuan { get; set; } = null!;
    }
    public class CreateReviewDto
    {
        public string MaDatPhong { get; set; } = null!;
        public int DanhGia { get; set; }
        public string BinhLuan { get; set; } = null!;
    }

    public class UpdateReviewDto
    {
        public int DanhGia { get; set; }
        public string BinhLuan { get; set; } = null!;
    }
}
