using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Services
{
    public interface IKhuyenMaiRepository
    {
        List<KhuyenMaiDTO> GetAll();
        JsonResult GetKhuyenMaiById(string MaKhuyenMai);
        JsonResult CreateKhuyenMai(CreateKhuyenMaiDTO createKhuyenMai);
        JsonResult UpdateKhuyenMai(string MaKhuyenMai, UpdateKhuyenMaiDTO updateKhuyenMai);
        JsonResult UpdateTrangThai(string MaKhuyenMai, string TrangThai);
        JsonResult DeleteKhuyenMai(string MaKhuyenMai);
    }
    public class KhuyenMaiRepository : IKhuyenMaiRepository
    {
        private readonly QuanLyKhachSanContext _context;
        private readonly IWriteFileRepository _fileRepository;
        private readonly ILogger<KhuyenMaiRepository> _logger;

        public KhuyenMaiRepository(QuanLyKhachSanContext context, IWriteFileRepository fileRepository, ILogger<KhuyenMaiRepository> logger)
        {
            _context = context;
            _fileRepository = fileRepository;
            _logger = logger;
        }

        public List<KhuyenMaiDTO> GetAll()
        {
            var khuyenMais = _context.KhuyenMais.ToList();
            return khuyenMais.Select(km => new KhuyenMaiDTO
            {
                MaKm = km.MaKm,
                TenKhuyenMai = km.TenKhuyenMai,
                Thumbnail = km.Thumbnail,
                MoTa = km.MoTa,
                MaGiamGia = km.MaGiamGia,
                PhanTramGiam = km.PhanTramGiam,
                SoTienGiam = km.SoTienGiam,
                NgayBatDau = km.NgayBatDau,
                NgayKetThuc = km.NgayKetThuc,
                TrangThai = km.TrangThai
            }).ToList();
        }
        public JsonResult GetKhuyenMaiById(string MaKhuyenMai)
        {
            var khuyenMai = _context.KhuyenMais.FirstOrDefault(km => km.MaKm == MaKhuyenMai);
            if (khuyenMai == null)
            {
                return new JsonResult(null) { StatusCode = 404 };
            }
            var _khuyenMai = new KhuyenMaiDTO
            {
                MaKm = khuyenMai.MaKm,
                TenKhuyenMai = khuyenMai.TenKhuyenMai,
                Thumbnail = khuyenMai.Thumbnail,
                MoTa = khuyenMai.MoTa,
                MaGiamGia = khuyenMai.MaGiamGia,
                PhanTramGiam = khuyenMai.PhanTramGiam,
                SoTienGiam = khuyenMai.SoTienGiam,
                NgayBatDau = khuyenMai.NgayBatDau,
                NgayKetThuc = khuyenMai.NgayKetThuc,
                TrangThai = khuyenMai.TrangThai
            };
            return new JsonResult(_khuyenMai) { StatusCode = 200 };
        }
        public JsonResult CreateKhuyenMai(CreateKhuyenMaiDTO createKhuyenMai)
        {
            try
            {
                var lastKhuyenMai = _context.KhuyenMais
                    .OrderByDescending(km => km.MaKm)
                    .FirstOrDefault();

                string newMaKhuyenMai;

                if (lastKhuyenMai == null || string.IsNullOrEmpty(lastKhuyenMai.MaKm))
                {
                    newMaKhuyenMai = "KM001";
                }
                else
                {
                    int lastId = int.Parse(lastKhuyenMai.MaKm.Substring(2));
                    newMaKhuyenMai = "KM" + (lastId + 1).ToString("D3");
                }

                string thumbnailUrl = createKhuyenMai.Thumbnail ?? "";

                // Handle file upload if ThumbnailFile is provided
                if (createKhuyenMai.ThumbnailFile != null)
                {
                    var uploadResult = _fileRepository.WriteFileAsync(createKhuyenMai.ThumbnailFile, "promotions").Result;
                    thumbnailUrl = uploadResult;
                }
                else if (string.IsNullOrEmpty(createKhuyenMai.Thumbnail))
                {
                    return new JsonResult("Thumbnail là bắt buộc.")
                    {
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                var khuyenMai = new KhuyenMai
                {
                    MaKm = newMaKhuyenMai,
                    TenKhuyenMai = createKhuyenMai.TenKhuyenMai,
                    Thumbnail = thumbnailUrl,
                    MoTa = createKhuyenMai.MoTa,
                    MaGiamGia = createKhuyenMai.MaGiamGia,
                    PhanTramGiam = createKhuyenMai.PhanTramGiam,
                    SoTienGiam = createKhuyenMai.SoTienGiam,
                    NgayBatDau = createKhuyenMai.NgayBatDau,
                    NgayKetThuc = createKhuyenMai.NgayKetThuc,
                    TrangThai = "Chưa bắt đầu"
                };

                _context.KhuyenMais.Add(khuyenMai);
                _context.SaveChanges();

                _logger.LogInformation($"Created new promotion: {newMaKhuyenMai}");

                return new JsonResult(new
                {
                    message = "Thêm mã khuyến mãi thành công.",
                    khuyenMai = newMaKhuyenMai
                })
                {
                    StatusCode = StatusCodes.Status201Created
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating promotion");
                return new JsonResult($"Lỗi khi tạo khuyến mãi: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
        public JsonResult UpdateKhuyenMai(string MaKhuyenMai, UpdateKhuyenMaiDTO updateKhuyenMai)
        {
            try
            {
                var khuyenMai = _context.KhuyenMais.FirstOrDefault(km => km.MaKm == MaKhuyenMai);
                if (khuyenMai == null)
                {
                    return new JsonResult("Không tìm thấy khuyến mãi với mã đã cho.")
                    {
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                string thumbnailUrl = khuyenMai.Thumbnail ?? "";

                // Handle file upload if ThumbnailFile is provided
                if (updateKhuyenMai.ThumbnailFile != null)
                {
                    // Delete old thumbnail if exists
                    if (!string.IsNullOrEmpty(khuyenMai.Thumbnail))
                    {
                        _ = _fileRepository.DeleteFileAsync(khuyenMai.Thumbnail);
                    }

                    // Upload new thumbnail
                    var uploadResult = _fileRepository.WriteFileAsync(updateKhuyenMai.ThumbnailFile, "promotions").Result;
                    thumbnailUrl = uploadResult;
                }
                else if (!string.IsNullOrEmpty(updateKhuyenMai.Thumbnail))
                {
                    // Keep existing URL or use provided URL
                    thumbnailUrl = updateKhuyenMai.Thumbnail;
                }

                khuyenMai.TenKhuyenMai = updateKhuyenMai.TenKhuyenMai;
                khuyenMai.Thumbnail = thumbnailUrl;
                khuyenMai.MoTa = updateKhuyenMai.MoTa;
                khuyenMai.MaGiamGia = updateKhuyenMai.MaGiamGia;
                khuyenMai.PhanTramGiam = updateKhuyenMai.PhanTramGiam;
                khuyenMai.SoTienGiam = updateKhuyenMai.SoTienGiam;
                khuyenMai.NgayBatDau = updateKhuyenMai.NgayBatDau;
                khuyenMai.NgayKetThuc = updateKhuyenMai.NgayKetThuc;

                _context.SaveChanges();

                _logger.LogInformation($"Updated promotion: {MaKhuyenMai}");

                return new JsonResult(new
                {
                    message = "Cập nhật mã khuyến mãi thành công.",
                    khuyenMai = MaKhuyenMai
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating promotion {MaKhuyenMai}");
                return new JsonResult($"Lỗi khi cập nhật khuyến mãi: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
        public JsonResult DeleteKhuyenMai(string MaKhuyenMai)
        {
            try
            {
                var khuyenMai = _context.KhuyenMais.FirstOrDefault(km => km.MaKm == MaKhuyenMai);
                if (khuyenMai == null)
                {
                    return new JsonResult("Không tìm thấy khuyến mãi với mã đã cho.")
                    {
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                // Delete thumbnail from Supabase if exists
                if (!string.IsNullOrEmpty(khuyenMai.Thumbnail))
                {
                    _ = _fileRepository.DeleteFileAsync(khuyenMai.Thumbnail);
                }

                _context.KhuyenMais.Remove(khuyenMai);
                _context.SaveChanges();

                _logger.LogInformation($"Deleted promotion: {MaKhuyenMai}");

                return new JsonResult(new
                {
                    message = "Xóa mã khuyến mãi thành công.",
                    khuyenMai = MaKhuyenMai
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting promotion {MaKhuyenMai}");
                return new JsonResult($"Lỗi khi xóa khuyến mãi: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
        public JsonResult UpdateTrangThai(string MaKhuyenMai, string TrangThai)
        {
            var khuyenMai = _context.KhuyenMais.FirstOrDefault(km => km.MaKm == MaKhuyenMai);
            if (khuyenMai == null)
            {
                return new JsonResult("Không tìm thấy dịch vụ với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {
                khuyenMai.TrangThai = TrangThai;
                _context.SaveChanges();
                return new JsonResult(new
                {
                    message = "Cập nhật trạng thái mã khuyến mãi thành công.",
                    khuyenMai = MaKhuyenMai
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
        }
    }
}
    