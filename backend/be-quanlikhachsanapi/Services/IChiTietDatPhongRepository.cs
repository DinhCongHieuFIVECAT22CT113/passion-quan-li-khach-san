using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;

namespace be_quanlikhachsanapi.Services
{
    public interface IChiTietDatPhongRepository
    {
        List<ChiTietDatPhongDto> GetAll();
        JsonResult GetChiTietDatPhongById(string MaChiTietDatPhong);
        JsonResult CreateChiTietDatPhong(CreateChiTietDatPhongDto createChiTietDatPhong);
        JsonResult UpdateChiTietDatPhong(string MaChiTietDatPhong, UpdateChiTietDatPhongDto updateChiTietDatPhong);
        JsonResult DeleteChiTietDatPhong(string MaChiTietDatPhong);
    }
    public class ChiTietDatPhongRepository : IChiTietDatPhongRepository
    {
        private readonly QuanLyKhachSanContext _context;
        public ChiTietDatPhongRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public List<ChiTietDatPhongDto> GetAll()
        {
            var chiTietDatPhongs = _context.ChiTietDatPhongs.ToList();
            return chiTietDatPhongs.Select(ctdp => new ChiTietDatPhongDto
            {
                MaChiTietDatPhong = ctdp.MaChiTietDatPhong,
                MaDatPhong = ctdp.MaDatPhong,
                MaLoaiPhong = ctdp.MaLoaiPhong,
                MaPhong = ctdp.MaPhong
            }).ToList();
        }

        public JsonResult GetChiTietDatPhongById(string MaChiTietDatPhong)
        {
            var chiTietDatPhong = _context.ChiTietDatPhongs.FirstOrDefault(ctdp => ctdp.MaChiTietDatPhong == MaChiTietDatPhong);
            if (chiTietDatPhong == null)
            {
                return new JsonResult("Không tìm thấy chi tiết đặt phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            var _chiTietDatPhong = new ChiTietDatPhongDto
            {
                MaChiTietDatPhong = chiTietDatPhong.MaChiTietDatPhong,
                MaDatPhong = chiTietDatPhong.MaDatPhong,
                MaLoaiPhong = chiTietDatPhong.MaLoaiPhong,
                MaPhong = chiTietDatPhong.MaPhong
            };
            return new JsonResult(_chiTietDatPhong)
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public JsonResult CreateChiTietDatPhong(CreateChiTietDatPhongDto createChiTietDatPhong)
        {
            var lastChiTietDatPhong = _context.ChiTietDatPhongs.
                OrderByDescending(ctdp => ctdp.MaChiTietDatPhong)
                .FirstOrDefault();

            string newMaChiTietDatPhong;
            if (lastChiTietDatPhong == null)
            {
                newMaChiTietDatPhong = "CTDP001";
            }
            else
            {
                int lastNumber = int.Parse(lastChiTietDatPhong.MaChiTietDatPhong.Substring(4));
                newMaChiTietDatPhong = "CTDP" + (lastNumber + 1).ToString("D3");
            }
            var chiTietDatPhong = new ChiTietDatPhong
            {
                MaChiTietDatPhong = newMaChiTietDatPhong,
                MaDatPhong = createChiTietDatPhong.MaDatPhong,
                MaLoaiPhong = createChiTietDatPhong.MaLoaiPhong,
                MaPhong = createChiTietDatPhong.MaPhong
            };
            _context.ChiTietDatPhongs.Add(chiTietDatPhong);
            _context.SaveChanges();
            return new JsonResult(new
            {
                message = "Thêm chi tiết đặt phòng thành công.",
                chiTietDatPhong = newMaChiTietDatPhong
            })
            {
                StatusCode = StatusCodes.Status201Created
            };
        }

        public JsonResult UpdateChiTietDatPhong(string MaChiTietDatPhong, UpdateChiTietDatPhongDto updateChiTietDatPhong)
        {
            var chiTietDatPhong = _context.ChiTietDatPhongs.FirstOrDefault(ctdp => ctdp.MaChiTietDatPhong == MaChiTietDatPhong);
            if (chiTietDatPhong == null)
            {
                return new JsonResult("Không tìm thấy chi tiết đặt phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            chiTietDatPhong.MaLoaiPhong = updateChiTietDatPhong.MaLoaiPhong;
            chiTietDatPhong.MaPhong = updateChiTietDatPhong.MaPhong;
            _context.SaveChanges();
            return new JsonResult(new
            {
                message = "Cập nhật chi tiết đặt phòng thành công.",
                chiTietDatPhong = chiTietDatPhong.MaChiTietDatPhong
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public JsonResult DeleteChiTietDatPhong(string MaChiTietDatPhong)
        {
            var chiTietDatPhong = _context.ChiTietDatPhongs.FirstOrDefault(ctdp => ctdp.MaChiTietDatPhong == MaChiTietDatPhong);
            if (chiTietDatPhong == null)
            {
                return new JsonResult("Không tìm thấy chi tiết đặt phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            _context.ChiTietDatPhongs.Remove(chiTietDatPhong);
            _context.SaveChanges();
            return new JsonResult(new
            {
                message = "Xóa chi tiết đặt phòng thành công.",
                chiTietDatPhong = chiTietDatPhong.MaChiTietDatPhong
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }
    }
}