using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http; // Thêm namespace này

namespace be_quanlikhachsanapi.Services
{
    public interface IDatPhongRepository
    {
        List<DatPhongDTO> GetAll();
        JsonResult GetDatPhongById(string MaDatPhong);
        JsonResult CreateDatPhong(CreateDatPhongDTO createDatPhong);
        JsonResult UpdateDatPhong(string MaDatPhong, UpdateDatPhongDTO updateDatPhong);
        JsonResult UpdateTrangThai(string MaDatPhong, string TrangThai);
        JsonResult DeleteDatPhong(string MaDatPhong);
    }

    public class DatPhongRepository : IDatPhongRepository
    {
        private readonly QuanLyKhachSanContext _context;

        public DatPhongRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public List<DatPhongDTO> GetAll()
        {
            var datPhongs = _context.DatPhongs.ToList();
            return datPhongs.Select(dp => new DatPhongDTO
            {
                MaDatPhong = dp.MaDatPhong,
                MaKH = dp.MaKh,
                MaPhong = _context.ChiTietDatPhongs
                    .Where(ct => ct.MaDatPhong == dp.MaDatPhong)
                    .Select(ct => ct.MaPhong)
                    .FirstOrDefault(),
                TreEm = dp.TreEm,
                NguoiLon = dp.NguoiLon,
                GhiChu = dp.GhiChu,
                SoLuongPhong = dp.SoLuongPhong,
                ThoiGianDen = dp.ThoiGianDen,
                NgayNhanPhong = dp.NgayNhanPhong,
                NgayTraPhong = dp.NgayTraPhong,
                TrangThai = dp.TrangThai,
            }).ToList();
        }

        public JsonResult GetDatPhongById(string MaDatPhong)
        {
            var datPhong = _context.DatPhongs.FirstOrDefault(dp => dp.MaDatPhong == MaDatPhong);
            if (datPhong == null)
            {
                return new JsonResult(null) { StatusCode = 404 };
            }

            var _datPhong = new DatPhongDTO
            {
                MaDatPhong = datPhong.MaDatPhong,
                MaKH = datPhong.MaKh, // Sửa MaKH thành MaKh
                MaPhong = _context.ChiTietDatPhongs
                    .Where(ct => ct.MaDatPhong == datPhong.MaDatPhong)
                    .Select(ct => ct.MaPhong)
                    .FirstOrDefault(),  
                TreEm = datPhong.TreEm,
                NguoiLon = datPhong.NguoiLon,
                GhiChu = datPhong.GhiChu,
                SoLuongPhong = datPhong.SoLuongPhong,
                ThoiGianDen = datPhong.ThoiGianDen,
                NgayNhanPhong = datPhong.NgayNhanPhong,
                NgayTraPhong = datPhong.NgayTraPhong,
                TrangThai = datPhong.TrangThai,
            };
            return new JsonResult(_datPhong);
        }

        public JsonResult CreateDatPhong(CreateDatPhongDTO createDatPhong)
        {
            var lastDatPhong = _context.DatPhongs
                .OrderByDescending(dp => dp.MaDatPhong)
                .FirstOrDefault();

            string newMaDatPhong;

            if (lastDatPhong == null || string.IsNullOrEmpty(lastDatPhong.MaDatPhong))
            {
                newMaDatPhong = "DP001";
            }
            else
            {
                var soHienTai = int.Parse(lastDatPhong.MaDatPhong.Substring(2));
                newMaDatPhong = "DP" + (soHienTai + 1).ToString("D3");
            }

            var datPhong = new DatPhong
            {
                MaDatPhong = newMaDatPhong,
                MaKh = createDatPhong.MaKH,
                TreEm = createDatPhong.TreEm,
                NguoiLon = createDatPhong.NguoiLon,
                GhiChu = createDatPhong.GhiChu,
                SoLuongPhong = createDatPhong.SoLuongPhong,
                ThoiGianDen = createDatPhong.ThoiGianDen,
                NgayNhanPhong = createDatPhong.NgayNhanPhong,
                NgayTraPhong = createDatPhong.NgayTraPhong,
                TrangThai = "Chưa xác nhận",
                NgayTao = DateTime.Now,
                NgaySua = DateTime.Now,
            };

            _context.DatPhongs.Add(datPhong);
            _context.SaveChanges();

            var loaiPhong = _context.Phongs
                .Where(p => p.MaPhong == createDatPhong.MaPhong)
                .Select(p => p.MaLoaiPhong)
                .FirstOrDefault();

            if (loaiPhong == null)
            {
                return new JsonResult("Không tìm thấy loại phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            var lastChiTietDatPhong = _context.ChiTietDatPhongs
                .OrderByDescending(ctdp => ctdp.MaChiTietDatPhong)
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
                MaDatPhong = newMaDatPhong,
                MaPhong = createDatPhong.MaPhong,
                MaLoaiPhong = loaiPhong
            };
            _context.ChiTietDatPhongs.Add(chiTietDatPhong);
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Đặt phòng thành công.",
                datPhong = newMaDatPhong
            })
            {
                StatusCode = StatusCodes.Status201Created
            };
        }

        public JsonResult UpdateDatPhong(string MaDatPhong, UpdateDatPhongDTO updateDatPhong)
        {
            var datPhong = _context.DatPhongs.FirstOrDefault(dp => dp.MaDatPhong == MaDatPhong);
            if (datPhong == null)
            {
                return new JsonResult("Không tìm thấy thông tin đặt phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            // Cập nhật thông tin đặt phòng
            datPhong.TreEm = updateDatPhong.TreEm ?? datPhong.TreEm;
            datPhong.NguoiLon = updateDatPhong.NguoiLon ?? datPhong.NguoiLon;
            datPhong.GhiChu = updateDatPhong.GhiChu ?? datPhong.GhiChu;
            datPhong.SoLuongPhong = updateDatPhong.SoLuongPhong ?? datPhong.SoLuongPhong;
            datPhong.ThoiGianDen = updateDatPhong.ThoiGianDen ?? datPhong.ThoiGianDen;
            datPhong.NgayNhanPhong = updateDatPhong.NgayNhanPhong ?? datPhong.NgayNhanPhong;
            datPhong.NgayTraPhong = updateDatPhong.NgayTraPhong ?? datPhong.NgayTraPhong;
            datPhong.NgaySua = DateTime.Now;

            _context.DatPhongs.Update(datPhong);
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Cập nhật thông tin đặt phòng thành công.",
                maDatPhong = MaDatPhong
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public JsonResult DeleteDatPhong(string MaDatPhong)
        {
            var datPhong = _context.DatPhongs.FirstOrDefault(dp => dp.MaDatPhong == MaDatPhong);
            if (datPhong == null)
            {
                return new JsonResult("Không tìm thấy thông tin đặt phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            _context.DatPhongs.Remove(datPhong);
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Xóa thông tin đặt phòng thành công.",
                maDatPhong = MaDatPhong
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public JsonResult UpdateTrangThai(string MaDatPhong, string TrangThai)
        {
            var datPhong = _context.DatPhongs.FirstOrDefault(dp => dp.MaDatPhong == MaDatPhong);
            if (datPhong == null)
            {
                return new JsonResult("Không tìm thấy thông tin đặt phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            datPhong.TrangThai = TrangThai;
            datPhong.NgaySua = DateTime.Now;
            _context.SaveChanges();
            return new JsonResult(new
            {
                message = "Cập nhật trạng thái đặt phòng thành công.",
                maDatPhong = MaDatPhong
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }
    }
}