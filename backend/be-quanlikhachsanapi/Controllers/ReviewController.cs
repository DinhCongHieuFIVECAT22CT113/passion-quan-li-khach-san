using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

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
        [Consumes("multipart/form-data")]
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
        [Consumes("multipart/form-data")]
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
        [Consumes("multipart/form-data")]
        public IActionResult DeleteReview(string MaReview)
        {
            var review = _reviewRepo.DeleteReview(MaReview);
            if (review == null)
            {
                return NotFound("Không tìm thấy đánh giá với ID đã cho.");
            }
            return Ok(review);
        }
    }
}