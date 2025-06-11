using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewRepository _reviewRepo;

        public ReviewController(IReviewRepository reviewRepo)
        {
            _reviewRepo = reviewRepo;
        }
        // Lấy danh sách tất cả đánh giá
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll()
        {
            var reviews = _reviewRepo.GetAll();
            if (reviews == null || reviews.Count == 0)
            {
                return NotFound("Không tìm thấy đánh giá nào.");
            }
            return Ok(reviews);
        }
        // Lấy đánh giá theo ID
        [HttpGet("{maReview}")]
        [AllowAnonymous]
        public IActionResult GetByID(string MaReview)
        {
            var review = _reviewRepo.GetReviewById(MaReview);
            if (review == null)
            {
                return NotFound("Không tìm thấy đánh giá với ID đã cho.");
            }
            return Ok(review);
        }
        // Tạo đánh giá mới
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize]
        public IActionResult CreateReview([FromForm] CreateReviewDto createReview)
        {
            var review = _reviewRepo.CreateReview(createReview);
            if (review == null)
            {
                return BadRequest("Không thể tạo đánh giá mới.");
            }
            return Ok(review);
        }
        // Cập nhật đánh giá
        [HttpPut("{maReview}")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R00")]
        public IActionResult UpdateReview(string MaReview, [FromForm] UpdateReviewDto updateReview)
        {
            var review = _reviewRepo.UpdateReview(MaReview, updateReview);
            if (review == null)
            {
                return NotFound("Không tìm thấy đánh giá với ID đã cho.");
            }
            return Ok(review);
        }
        // Xóa đánh giá
        [HttpDelete("{maReview}")]
        [Authorize]
        [RequireRole("R00")]
        public IActionResult DeleteReview(string MaReview)
        {
            var review = _reviewRepo.DeleteReview(MaReview);
            if (review == null)
            {
                return NotFound("Không tìm thấy đánh giá với ID đã cho.");
            }
            return Ok(review);
        }
        // Cập nhật trạng thái đánh giá
        [HttpPut("update-trang-thai/{maReview}")]
        [Authorize]
        [RequireRole("R00")]
        public IActionResult UpdateTrangThai(string MaReview, [FromBody] string TrangThai)
        {
            var review = _reviewRepo.UpdateTrangThai(MaReview, TrangThai);
            if (review == null)
            {
                return NotFound("Không tìm thấy đánh giá với ID đã cho.");
            }
            return Ok(review);
        }
    }
}