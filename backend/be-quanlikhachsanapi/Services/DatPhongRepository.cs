using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace be_quanlikhachsanapi.Services
{
    public class DatPhongRepository : IDatPhongRepository
    {
        private readonly DataQlks113Nhom2Context _context;
        private readonly INotificationService _notificationService;

        public DatPhongRepository(DataQlks113Nhom2Context context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
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
            try
            {
                // Validation cơ bản
                if (string.IsNullOrWhiteSpace(createDatPhong.MaKH))
                {
                    return new JsonResult(new { message = "Mã khách hàng không được để trống." })
                    {
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                if (string.IsNullOrWhiteSpace(createDatPhong.MaPhong))
                {
                    return new JsonResult(new { message = "Mã phòng không được để trống." })
                    {
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                // Kiểm tra khách hàng có tồn tại không
                var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.MaKh == createDatPhong.MaKH);
                if (khachHang == null)
                {
                    return new JsonResult(new { message = $"Không tìm thấy khách hàng với mã {createDatPhong.MaKH}." })
                    {
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                // Kiểm tra phòng có tồn tại không
                var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == createDatPhong.MaPhong);
                if (phong == null)
                {
                    return new JsonResult(new { message = $"Không tìm thấy phòng với mã {createDatPhong.MaPhong}." })
                    {
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                // Kiểm tra ngày hợp lệ
                if (createDatPhong.NgayNhanPhong >= createDatPhong.NgayTraPhong)
                {
                    return new JsonResult(new { message = "Ngày trả phòng phải sau ngày nhận phòng." })
                    {
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

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
                    MaLoaiPhong = phong.MaLoaiPhong
                };
                _context.ChiTietDatPhongs.Add(chiTietDatPhong);
                _context.SaveChanges();
                
                // Cập nhật trạng thái phòng thành "Đã đặt"
                phong.TrangThai = "Đã đặt";
                phong.NgaySua = DateTime.Now;
                _context.SaveChanges();
                
                // Gửi thông báo realtime
                _notificationService.NotifyBookingCreated(datPhong).Wait();
                _notificationService.NotifyRoomStatusChanged(phong.MaPhong, "Đã đặt").Wait();

                return new JsonResult(new
                {
                    message = "Đặt phòng thành công.",
                    datPhong = newMaDatPhong
                })
                {
                    StatusCode = StatusCodes.Status201Created
                };
            }
            catch (Exception ex)
            {
                return new JsonResult(new { message = $"Lỗi khi tạo đặt phòng: {ex.Message}" })
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
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

            // Cập nhật thông tin đặt phòng với các trường không null
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

            // Nếu cần, cập nhật chi tiết đặt phòng (ChiTietDatPhong)
            if (!string.IsNullOrEmpty(updateDatPhong.MaPhong))
            {
                var chiTietDatPhong = _context.ChiTietDatPhongs.FirstOrDefault(ctdp => ctdp.MaDatPhong == MaDatPhong);
                if (chiTietDatPhong != null)
                {
                    // Tìm loại phòng mới theo mã phòng cập nhật
                    var loaiPhong = _context.Phongs
                        .Where(p => p.MaPhong == updateDatPhong.MaPhong)
                        .Select(p => p.MaLoaiPhong)
                        .FirstOrDefault();

                    if (loaiPhong == null)
                    {
                        return new JsonResult("Không tìm thấy loại phòng với mã đã cho.")
                        {
                            StatusCode = StatusCodes.Status404NotFound
                        };
                    }

                    chiTietDatPhong.MaPhong = updateDatPhong.MaPhong;
                    chiTietDatPhong.MaLoaiPhong = loaiPhong;

                    _context.ChiTietDatPhongs.Update(chiTietDatPhong);
                    _context.SaveChanges();
                }
            }

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

            // Xóa chi tiết đặt phòng liên quan trước nếu có
            var chiTietDatPhongs = _context.ChiTietDatPhongs.Where(ctdp => ctdp.MaDatPhong == MaDatPhong).ToList();
            if (chiTietDatPhongs.Any())
            {
                _context.ChiTietDatPhongs.RemoveRange(chiTietDatPhongs);
            }

            // Xóa bản ghi đặt phòng
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
            
            string oldTrangThai = datPhong.TrangThai;
            datPhong.TrangThai = TrangThai;
            datPhong.NgaySua = DateTime.Now;
            
            // Cập nhật trạng thái phòng tương ứng
            var chiTietDatPhong = _context.ChiTietDatPhongs.FirstOrDefault(ct => ct.MaDatPhong == MaDatPhong);
            if (chiTietDatPhong?.MaPhong != null)
            {
                var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == chiTietDatPhong.MaPhong);
                if (phong != null)
                {
                    string oldPhongTrangThai = phong.TrangThai;
                    
                    switch (TrangThai)
                    {
                        case "Đã xác nhận":
                            phong.TrangThai = "Đã đặt";
                            break;
                        case "Đã hủy":
                            phong.TrangThai = "Trống";
                            break;
                        case "Đã trả phòng":
                            phong.TrangThai = "Đang dọn";
                            break;
                    }
                    
                    phong.NgaySua = DateTime.Now;
                    
                    // Gửi thông báo cập nhật trạng thái phòng
                    if (oldPhongTrangThai != phong.TrangThai)
                    {
                        _notificationService.NotifyRoomStatusChanged(phong.MaPhong, phong.TrangThai).Wait();
                    }
                }
            }
            
            _context.SaveChanges();
            
            // Gửi thông báo cập nhật trạng thái đặt phòng
            _notificationService.NotifyBookingStatusChanged(MaDatPhong, TrangThai).Wait();
            
            return new JsonResult(new
            {
                message = "Cập nhật trạng thái đặt phòng thành công.",
                maDatPhong = MaDatPhong
            })
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public async Task<IEnumerable<DatPhong>> GetDatPhongByKhachHang(string maKhachHang)
        {
            return await _context.DatPhongs
                .Where(dp => dp.MaKh == maKhachHang)
                .ToListAsync();
        }
    }
}