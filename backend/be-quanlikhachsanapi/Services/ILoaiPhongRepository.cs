using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Services
{
    public interface ILoaiPhongRepository
    {
        List<LoaiPhongDTO> GetAll();
        JsonResult GetLoaiPhongById(string MaLoaiPhong);
        JsonResult CreateLoaiPhong(CreateLoaiPhongDTO createLoaiPhong);
        JsonResult UpdateLoaiPhong(string MaLoaiPhong, UpdateLoaiPhongDTO updateLoaiPhong);
        JsonResult DeleteLoaiPhong(string MaLoaiPhong);
    }
    public class LoaiPhongRepository : ILoaiPhongRepository
    {
        private readonly QuanLyKhachSanContext _context;

        public LoaiPhongRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public List<LoaiPhongDTO> GetAll()
        {
            var loaiPhongs = _context.LoaiPhongs.ToList();
            return loaiPhongs.Select(lp => new LoaiPhongDTO
            {
                MaLoaiPhong = lp.MaLoaiPhong,
                TenLoaiPhong = lp.TenLoaiPhong,
                MoTa = lp.MoTa,
                GiaMoiGio = lp.GiaMoiGio,
                GiaMoiDem = lp.GiaMoiDem,
                SoPhongTam = lp.SoPhongTam,
                SoGiuongNgu = lp.SoGiuongNgu,
                GiuongDoi = lp.GiuongDoi,
                GiuongDon = lp.GiuongDon,
                KichThuocPhong = lp.KichThuocPhong,
                SucChua = lp.SucChua,
                Thumbnail = lp.Thumbnail
            }).ToList();
        }
        public JsonResult GetLoaiPhongById(string MaLoaiPhong)
        {
            var loaiPhong = _context.LoaiPhongs.FirstOrDefault(lp => lp.MaLoaiPhong == MaLoaiPhong);
            if (loaiPhong == null)
            {
                return new JsonResult(null) { StatusCode = 404 };
            }
            var _loaiPhong = new LoaiPhongDTO
            {
                MaLoaiPhong = loaiPhong.MaLoaiPhong,
                TenLoaiPhong = loaiPhong.TenLoaiPhong,
                MoTa = loaiPhong.MoTa,
                GiaMoiGio = loaiPhong.GiaMoiGio,
                GiaMoiDem = loaiPhong.GiaMoiDem,
                SoPhongTam = loaiPhong.SoPhongTam,
                SoGiuongNgu = loaiPhong.SoGiuongNgu,
                GiuongDoi = loaiPhong.GiuongDoi,
                GiuongDon = loaiPhong.GiuongDon,
                KichThuocPhong = loaiPhong.KichThuocPhong,
                SucChua = loaiPhong.SucChua,
                Thumbnail = loaiPhong.Thumbnail
            };
            return new JsonResult(_loaiPhong);
        }
        public JsonResult CreateLoaiPhong(CreateLoaiPhongDTO createLoaiPhong)
        {
            var lastLoaiPhong = _context.LoaiPhongs
                .OrderByDescending(lp => lp.MaLoaiPhong)
                .FirstOrDefault();

            string newMaLoaiPhong;

            if (lastLoaiPhong == null || string.IsNullOrEmpty(lastLoaiPhong.MaLoaiPhong))
            {
                newMaLoaiPhong = "LP01";
            }
            else
            {
                // Tách phần số trong mã phòng (ví dụ từ "P023" => 23)
                var soHienTai = int.Parse(lastLoaiPhong.MaLoaiPhong.Substring(2));
                newMaLoaiPhong = "LP" + (soHienTai + 1).ToString("D2");
            }
            var loaiPhong = new LoaiPhong
            {
                MaLoaiPhong = newMaLoaiPhong,
                TenLoaiPhong = createLoaiPhong.TenLoaiPhong,
                MoTa = createLoaiPhong.MoTa,
                GiaMoiGio = createLoaiPhong.GiaMoiGio,
                GiaMoiDem = createLoaiPhong.GiaMoiDem,
                SoPhongTam = createLoaiPhong.SoPhongTam,
                SoGiuongNgu = createLoaiPhong.SoGiuongNgu,
                GiuongDoi = createLoaiPhong.GiuongDoi,
                GiuongDon = createLoaiPhong.GiuongDon,
                KichThuocPhong = createLoaiPhong.KichThuocPhong,
                SucChua = createLoaiPhong.SucChua,
                Thumbnail = createLoaiPhong.Thumbnail,
                NgayTao = DateTime.Now,
                NgaySua = DateTime.Now
            };
            _context.LoaiPhongs.Add(loaiPhong);
            _context.SaveChanges();
             return new JsonResult(new
            {
                message = "Thêm loại phòng thành công.",
                loaiPhong = newMaLoaiPhong
            })
            {
                StatusCode = StatusCodes.Status201Created
            };
        }
        public JsonResult UpdateLoaiPhong(string MaLoaiPhong, UpdateLoaiPhongDTO updateLoaiPhong)
        {
            var loaiPhong = _context.LoaiPhongs.FirstOrDefault(lp => lp.MaLoaiPhong == MaLoaiPhong);
            if (loaiPhong == null)
            {
                return new JsonResult("Không tìm thấy loại phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {
                loaiPhong.TenLoaiPhong = updateLoaiPhong.TenLoaiPhong;
                loaiPhong.MoTa = updateLoaiPhong.MoTa;
                loaiPhong.GiaMoiGio = updateLoaiPhong.GiaMoiGio;
                loaiPhong.GiaMoiDem = updateLoaiPhong.GiaMoiDem;
                loaiPhong.SoPhongTam = updateLoaiPhong.SoPhongTam;
                loaiPhong.SoGiuongNgu = updateLoaiPhong.SoGiuongNgu;
                loaiPhong.GiuongDoi = updateLoaiPhong.GiuongDoi;
                loaiPhong.GiuongDon = updateLoaiPhong.GiuongDon;
                loaiPhong.KichThuocPhong = updateLoaiPhong.KichThuocPhong;
                loaiPhong.SucChua = updateLoaiPhong.SucChua;
                loaiPhong.Thumbnail = updateLoaiPhong.Thumbnail;
                loaiPhong.NgaySua = DateTime.Now;

                _context.SaveChanges();
                return new JsonResult(new
                {
                    message = "Cập nhật loại phòng thành công.",
                    maLoaiPhong = MaLoaiPhong
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
        }
        public JsonResult DeleteLoaiPhong(string MaLoaiPhong)
        {
            var loaiPhong = _context.LoaiPhongs.FirstOrDefault(lp => lp.MaLoaiPhong == MaLoaiPhong);
            if (loaiPhong == null)
            {
                return new JsonResult("Không tìm thấy loại phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {
                _context.LoaiPhongs.Remove(loaiPhong);
                _context.SaveChanges();
                return new JsonResult(new
                {
                    message = "Xóa loại phòng thành công.",
                    maLoaiPhong = MaLoaiPhong
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
        }
    }
}