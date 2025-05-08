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
                MaKH = dp.MaKh, // Sửa MaKH thành MaKh (chữ h viết thường)
                TreEm = dp.TreEm,
                NguoiLon = dp.NguoiLon,
                GhiChu = dp.GhiChu,
                SoLuongPhong = dp.SoLuongPhong,
                ThoiGianDen = dp.ThoiGianDen,
                NgayNhanPhong = dp.NgayNhanPhong,
                NgayTraPhong = dp.NgayTraPhong,
                TrangThai = dp.TrangThai,
                NgayTao = dp.NgayTao,
                NgaySua = dp.NgaySua,
                GiaGoc = dp.GiaGoc,
                TongTien = dp.TongTien
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
                TreEm = datPhong.TreEm,
                NguoiLon = datPhong.NguoiLon,
                GhiChu = datPhong.GhiChu,
                SoLuongPhong = datPhong.SoLuongPhong,
                ThoiGianDen = datPhong.ThoiGianDen,
                NgayNhanPhong = datPhong.NgayNhanPhong,
                NgayTraPhong = datPhong.NgayTraPhong,
                TrangThai = datPhong.TrangThai,
                NgayTao = datPhong.NgayTao,
                NgaySua = datPhong.NgaySua,
                GiaGoc = datPhong.GiaGoc,
                TongTien = datPhong.TongTien
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
                MaKh = createDatPhong.MaKH, // Sửa MaKH thành MaKh
                TreEm = createDatPhong.TreEm,
                NguoiLon = createDatPhong.NguoiLon,
                GhiChu = createDatPhong.GhiChu,
                SoLuongPhong = createDatPhong.SoLuongPhong,
                ThoiGianDen = createDatPhong.ThoiGianDen,
                NgayNhanPhong = createDatPhong.NgayNhanPhong,
                NgayTraPhong = createDatPhong.NgayTraPhong,
                TrangThai = createDatPhong.TrangThai,
                NgayTao = DateTime.Now,
                NgaySua = DateTime.Now,
                GiaGoc = createDatPhong.GiaGoc ?? 0m, // Thêm chuyển đổi từ decimal? sang decimal
                TongTien = createDatPhong.TongTien ?? 0m // Thêm chuyển đổi từ decimal? sang decimal
            };

            _context.DatPhongs.Add(datPhong);
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

            datPhong.MaKh = updateDatPhong.MaKH ?? datPhong.MaKh; // Sửa MaKH thành MaKh
            datPhong.TreEm = updateDatPhong.TreEm ?? datPhong.TreEm;
            datPhong.NguoiLon = updateDatPhong.NguoiLon ?? datPhong.NguoiLon;
            datPhong.GhiChu = updateDatPhong.GhiChu ?? datPhong.GhiChu;
            datPhong.SoLuongPhong = updateDatPhong.SoLuongPhong ?? datPhong.SoLuongPhong;
            datPhong.ThoiGianDen = updateDatPhong.ThoiGianDen ?? datPhong.ThoiGianDen;
            datPhong.NgayNhanPhong = updateDatPhong.NgayNhanPhong ?? datPhong.NgayNhanPhong;
            datPhong.NgayTraPhong = updateDatPhong.NgayTraPhong ?? datPhong.NgayTraPhong;
            datPhong.TrangThai = updateDatPhong.TrangThai ?? datPhong.TrangThai;
            datPhong.NgaySua = DateTime.Now;
            datPhong.GiaGoc = updateDatPhong.GiaGoc ?? datPhong.GiaGoc;
            datPhong.TongTien = updateDatPhong.TongTien ?? datPhong.TongTien;

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
    }
}