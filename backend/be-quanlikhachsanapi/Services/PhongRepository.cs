using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace be_quanlikhachsanapi.Services
{
    public class PhongRepository : IPhongRepository
    {
        private readonly QuanLyKhachSanContext _context;
        private readonly IWriteFileRepository _fileRepository;
        private readonly INotificationService _notificationService;
        
        public PhongRepository(QuanLyKhachSanContext context, IWriteFileRepository fileRepository, INotificationService notificationService)
        {
            _context = context;
            _fileRepository = fileRepository;
            _notificationService = notificationService;
        }

        public List<PhongDTO> GetAll()
        {
            var phongs = _context.Phongs.ToList();
            return phongs.Select(p => new PhongDTO
            {
                MaPhong = p.MaPhong,
                MaLoaiPhong = p.MaLoaiPhong,
                SoPhong = p.SoPhong,
                Thumbnail = p.Thumbnail,
                HinhAnh = p.HinhAnh,
                TrangThai = p.TrangThai,
                Tang = p.Tang
            }).ToList();
        }   
        
        public JsonResult GetPhongById(string MaPhong)
        {
            var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == MaPhong);
            if (phong == null)
            {
                return new JsonResult(new { message = "Không tìm thấy phòng với mã đã cho." })
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            
            var _phongDto = new PhongDTO
            {
                MaPhong = phong.MaPhong,
                MaLoaiPhong = phong.MaLoaiPhong,
                SoPhong = phong.SoPhong,
                Thumbnail = phong.Thumbnail,
                HinhAnh = phong.HinhAnh,
                TrangThai = phong.TrangThai,
                Tang = phong.Tang
            };
            return new JsonResult(_phongDto) { StatusCode = StatusCodes.Status200OK };
        }
        
        public async Task<JsonResult> CreatePhong(CreatePhongDTO createPhong)
        {
            try
            {
                // Tìm mã phòng mới lớn nhất hiện tại
                var lastPhong = _context.Phongs
                    .OrderByDescending(p => p.MaPhong)
                    .FirstOrDefault();

                string newMaPhong;

                if (lastPhong == null || string.IsNullOrEmpty(lastPhong.MaPhong))
                {
                    newMaPhong = "P001";
                }
                else
                {
                    // Tách phần số trong mã phòng (ví dụ từ "P023" => 23)
                    var soHienTai = int.Parse(lastPhong.MaPhong.Substring(2));
                    newMaPhong = "P" + (soHienTai + 1).ToString("D3");
                }

                string? thumbnailUrl = null;
                string? hinhAnhUrl = null;

                // Upload thumbnail nếu có file
                if (createPhong.ThumbnailFile != null)
                {
                    thumbnailUrl = await _fileRepository.WriteFileAsync(createPhong.ThumbnailFile, "rooms/thumbnail");
                }

                // Upload hình ảnh chi tiết nếu có file
                if (createPhong.HinhAnhFile != null)
                {
                    hinhAnhUrl = await _fileRepository.WriteFileAsync(createPhong.HinhAnhFile, "rooms/images");
                }

                var phong = new Phong
                {
                    MaPhong = newMaPhong,
                    MaLoaiPhong = createPhong.MaLoaiPhong,
                    SoPhong = createPhong.SoPhong,
                    Thumbnail = thumbnailUrl ?? createPhong.Thumbnail,
                    HinhAnh = hinhAnhUrl ?? createPhong.HinhAnh,
                    TrangThai = "Trống",
                    Tang = createPhong.Tang,
                    NgayTao = DateTime.Now,
                    NgaySua = DateTime.Now
                };

                _context.Phongs.Add(phong);
                _context.SaveChanges();

                return new JsonResult(new
                {
                    message = "Thêm phòng thành công.",
                    maPhong = newMaPhong
                })
                {
                    StatusCode = StatusCodes.Status201Created
                };
            }
            catch (Exception ex)
            {
                return new JsonResult($"Lỗi khi tạo phòng: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<JsonResult> UpdatePhong(string MaPhong, UpdatePhongDTO updatePhong)
        {
            try
            {
                var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == MaPhong);
                if (phong == null)
                {
                    return new JsonResult("Không tìm thấy phòng với mã đã cho.")
                    {
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                string? newThumbnailUrl = null;
                string? newHinhAnhUrl = null;

                // Upload thumbnail mới nếu có file
                if (updatePhong.ThumbnailFile != null)
                {
                    // Xóa thumbnail cũ nếu có
                    if (!string.IsNullOrEmpty(phong.Thumbnail))
                    {
                        await _fileRepository.DeleteFileAsync(phong.Thumbnail);
                    }
                    newThumbnailUrl = await _fileRepository.WriteFileAsync(updatePhong.ThumbnailFile, "rooms/thumbnail");
                }

                // Upload hình ảnh chi tiết mới nếu có file
                if (updatePhong.HinhAnhFile != null)
                {
                    // Xóa hình ảnh cũ nếu có
                    if (!string.IsNullOrEmpty(phong.HinhAnh))
                    {
                        await _fileRepository.DeleteFileAsync(phong.HinhAnh);
                    }
                    newHinhAnhUrl = await _fileRepository.WriteFileAsync(updatePhong.HinhAnhFile, "rooms/images");
                }

                // Cập nhật thông tin phòng
                phong.MaLoaiPhong = updatePhong.MaLoaiPhong;
                phong.SoPhong = updatePhong.SoPhong;
                phong.Thumbnail = newThumbnailUrl ?? updatePhong.Thumbnail ?? phong.Thumbnail;
                phong.HinhAnh = newHinhAnhUrl ?? updatePhong.HinhAnh ?? phong.HinhAnh;
                phong.Tang = updatePhong.Tang;
                phong.NgaySua = DateTime.Now;

                _context.SaveChanges();

                return new JsonResult("Cập nhật phòng thành công.")
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                return new JsonResult($"Lỗi khi cập nhật phòng: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public JsonResult DeletePhong(string MaPhong)
        {
            var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == MaPhong);
            if (phong == null)
            {
                return new JsonResult("Không tìm thấy phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {
                _context.Phongs.Remove(phong);
                _context.SaveChanges();

                return new JsonResult("Xóa phòng thành công.")
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
        }
        
        public JsonResult UpdateTrangThai(string MaPhong, string TrangThai)
        {
            var phong = _context.Phongs.FirstOrDefault(p => p.MaPhong == MaPhong);
            if (phong == null)
            {
                return new JsonResult("Không tìm thấy phòng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {
                string oldTrangThai = phong.TrangThai;
                phong.TrangThai = TrangThai;
                phong.NgaySua = DateTime.Now;
                _context.SaveChanges();
                
                // Gửi thông báo cập nhật trạng thái phòng
                _notificationService.NotifyRoomStatusChanged(MaPhong, TrangThai).Wait();

                return new JsonResult("Cập nhật trạng thái phòng thành công.")
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
        }    

        public async Task<List<PhongDTO>> GetPhongByMaLoaiPhongAsync(string maLoaiPhong)
        {
            var phongs = await _context.Phongs
                .Where(p => p.MaLoaiPhong == maLoaiPhong)
                .Select(p => new PhongDTO
                {
                    MaPhong = p.MaPhong,
                    MaLoaiPhong = p.MaLoaiPhong,
                    SoPhong = p.SoPhong,
                    Thumbnail = p.Thumbnail,
                    HinhAnh = p.HinhAnh,
                    TrangThai = p.TrangThai,
                    Tang = p.Tang
                })
                .ToListAsync();

            return phongs;
        }
    }
}