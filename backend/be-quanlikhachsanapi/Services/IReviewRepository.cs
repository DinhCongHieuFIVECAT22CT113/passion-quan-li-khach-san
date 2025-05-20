using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;

namespace be_quanlikhachsanapi.Services
{
    public interface IReviewRepository
    {
        List<ReviewDto> GetAll();
        JsonResult GetReviewById(string MaReview);
        JsonResult CreateReview(CreateReviewDto createReview);
        JsonResult UpdateReview(string MaReview, UpdateReviewDto updateReview);
        JsonResult DeleteReview(string MaReview);
    }

    public class ReviewRepository : IReviewRepository
    {
        private readonly QuanLyKhachSanContext _context;

        public ReviewRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public List<ReviewDto> GetAll()
        {
            var reviews = _context.Reviews.ToList();
            return reviews.Select(r => new ReviewDto
            {
                MaReview = r.MaReview,
                MaDatPhong = r.MaDatPhong,
                DanhGia = r.DanhGia,
                BinhLuan = r.BinhLuan
            }).ToList();
        }

        public JsonResult GetReviewById(string MaReview)
        {
            var review = _context.Reviews.FirstOrDefault(r => r.MaReview == MaReview);
            if (review == null)
            {
                return new JsonResult("Không tìm thấy đánh giá với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            var _review = new ReviewDto
            {
                MaReview = review.MaReview,
                MaDatPhong = review.MaDatPhong,
                DanhGia = review.DanhGia,
                BinhLuan = review.BinhLuan
            };
            return new JsonResult(_review);
        }

        public JsonResult CreateReview(CreateReviewDto createReview)
        {
            var lastRewiew = _context.Reviews
                .OrderByDescending(r => r.MaReview)
                .FirstOrDefault();

            string newMaReview;
            if (lastRewiew == null)
            {
                newMaReview = "RV001";
            }
            else
            {
                int lastNumber = int.Parse(lastRewiew.MaReview.Substring(3));
                newMaReview = "RV" + (lastNumber + 1).ToString("D3");
            }

            var review = new Review
            {
                MaReview = newMaReview,
                MaDatPhong = createReview.MaDatPhong,
                DanhGia = createReview.DanhGia,
                BinhLuan = createReview.BinhLuan
            };
            _context.Reviews.Add(review);
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Thêm đánh giá thành công.",
                review = newMaReview
            })
            {
                StatusCode = StatusCodes.Status201Created
            };
        }

        public JsonResult UpdateReview(string MaReview, UpdateReviewDto updateReview)
        {
            var review = _context.Reviews.FirstOrDefault(r => r.MaReview == MaReview);
            if (review == null)
            {
                return new JsonResult("Không tìm thấy đánh giá với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            review.DanhGia = updateReview.DanhGia;
            review.BinhLuan = updateReview.BinhLuan;
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Cập nhật đánh giá thành công.",
                review = MaReview
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public JsonResult DeleteReview(string MaReview)
        {
            var review = _context.Reviews.FirstOrDefault(r => r.MaReview == MaReview);
            if (review == null)
            {
                return new JsonResult("Không tìm thấy đánh giá với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            _context.Reviews.Remove(review);
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Xóa đánh giá thành công.",
                review = MaReview
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }
    }
}