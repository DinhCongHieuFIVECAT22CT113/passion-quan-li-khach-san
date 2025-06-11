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
        JsonResult UpdateTrangThai(string MaReview, string TrangThai);
    }

    public class ReviewRepository : IReviewRepository
    {
        private readonly DataQlks113Nhom2Context _context;

        public ReviewRepository(DataQlks113Nhom2Context context)
        {
            _context = context;
        }

        public List<ReviewDto> GetAll()
        {
            var reviews = _context.Reviews
                .Join(_context.DatPhongs, r => r.MaDatPhong, dp => dp.MaDatPhong, (r, dp) => new { Review = r, DatPhong = dp })
                .Join(_context.KhachHangs, rdp => rdp.DatPhong.MaKh, kh => kh.MaKh, (rdp, kh) => new { rdp.Review, rdp.DatPhong, KhachHang = kh })
                .ToList();

            return reviews.Select(r => new ReviewDto
            {
                MaReview = r.Review.MaReview,
                MaDatPhong = r.Review.MaDatPhong,
                DanhGia = r.Review.DanhGia,
                BinhLuan = r.Review.BinhLuan,
                NgayTao = r.Review.NgayTao,
                TrangThai = "Chưa duyệt", // Mock value since field doesn't exist in DB
                AnHien = false // Mock value since field doesn't exist in DB
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
                BinhLuan = review.BinhLuan,
                NgayTao = review.NgayTao,
                TrangThai = "Chưa duyệt", // Mock value since field doesn't exist in DB
                AnHien = false // Mock value since field doesn't exist in DB
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
                BinhLuan = createReview.BinhLuan,
                NgayTao = DateTime.Now,
                TrangThai = "Chưa duyệt"
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

        public JsonResult UpdateTrangThai(string MaReview, string TrangThai)
        {
            var review = _context.Reviews.FirstOrDefault(r => r.MaReview == MaReview);
            if (review == null)
            {
                return new JsonResult("Không tìm thấy đánh giá với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            review.TrangThai = TrangThai;
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Cập nhật trạng thái đánh giá thành công.",
                review = MaReview
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }
    }
}