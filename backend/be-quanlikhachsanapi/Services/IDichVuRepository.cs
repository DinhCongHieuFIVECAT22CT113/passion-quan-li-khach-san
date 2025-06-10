using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace be_quanlikhachsanapi.Services
{
    public interface IDichVuRepository
    {
        List<DichVuDTO> GetAll();
        JsonResult GetDichVuById(string MaDichVu);
        JsonResult CreateDichVu(CreateDichVuDTO createDichVu);
        JsonResult UpdateDichVu(string MaDichVu, UpdateDichVuDTO updateDichVu);
        JsonResult DeleteDichVu(string MaDichVu);
    }
    public class DichVuRepository : IDichVuRepository
    {
        private readonly QuanLyKhachSanContext _context;
        private readonly IWriteFileRepository _fileRepository;
        private readonly ILogger<DichVuRepository> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DichVuRepository(
            QuanLyKhachSanContext context, 
            IWriteFileRepository fileRepository, 
            ILogger<DichVuRepository> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _fileRepository = fileRepository;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public List<DichVuDTO> GetAll()
        {
            var dichVus = _context.DichVus.ToList();
            return dichVus.Select(dv => new DichVuDTO
            {
                MaDichVu = dv.MaDichVu,
                TenDichVu = dv.TenDichVu,
                Thumbnail = dv.Thumbnail,
                MoTa = dv.MoTa,
                DonGia = dv.DonGia
            }).ToList();
        }
        public JsonResult GetDichVuById(string MaDichVu)
        {
            var dichVu = _context.DichVus.FirstOrDefault(dv => dv.MaDichVu == MaDichVu);
            if (dichVu == null)
            {
                return new JsonResult(null) { StatusCode = 404 };
            }
            var _dichVu = new DichVuDTO
            {
                MaDichVu = dichVu.MaDichVu,
                TenDichVu = dichVu.TenDichVu,
                Thumbnail = dichVu.Thumbnail,
                MoTa = dichVu.MoTa,
                DonGia = dichVu.DonGia
            };
            return new JsonResult(_dichVu) { StatusCode = 200 };
        }
        public JsonResult CreateDichVu(CreateDichVuDTO createDichVu)
        {
            try
            {
                var lastDichVu = _context.DichVus
                    .OrderByDescending(dv => dv.MaDichVu)
                    .FirstOrDefault();

                string newMaDichVu;

                if (lastDichVu == null || string.IsNullOrEmpty(lastDichVu.MaDichVu))
                {
                    newMaDichVu = "DV01";
                }
                else
                {
                    // Tách phần số trong mã phòng (ví dụ từ "P023" => 23)
                    var soHienTai = int.Parse(lastDichVu.MaDichVu.Substring(2));
                    newMaDichVu = "DV" + (soHienTai + 1).ToString("D2");
                }

                string thumbnailUrl = "";

                // Handle file upload if Thumbnail is provided
                if (createDichVu.Thumbnail != null)
                {
                    try 
                    {
                        _logger.LogInformation($"Bắt đầu upload file: {createDichVu.Thumbnail.FileName}, Size: {createDichVu.Thumbnail.Length} bytes");
                        
                        var uploadResult = _fileRepository.WriteFileAsync(createDichVu.Thumbnail, "services").Result;
                        thumbnailUrl = uploadResult;
                        
                        _logger.LogInformation($"Upload thành công, URL: {thumbnailUrl}");
                        
                        // Kiểm tra URL trả về
                        if (string.IsNullOrEmpty(thumbnailUrl))
                        {
                            _logger.LogWarning("URL trả về rỗng sau khi upload");
                            return new JsonResult("Không thể upload hình ảnh. URL trả về rỗng.")
                            {
                                StatusCode = StatusCodes.Status500InternalServerError
                            };
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi khi upload file");
                        return new JsonResult($"Lỗi khi upload file: {ex.Message}")
                        {
                            StatusCode = StatusCodes.Status500InternalServerError
                        };
                    }
                }
                else
                {
                    return new JsonResult("Thumbnail là bắt buộc.")
                    {
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                var dichVu = new DichVu
                {
                    MaDichVu = newMaDichVu,
                    TenDichVu = createDichVu.TenDichVu,
                    Thumbnail = thumbnailUrl,
                    MoTa = createDichVu.MoTa,
                    DonGia = createDichVu.DonGia,
                    NgayTao = DateTime.Now,
                    NgaySua = DateTime.Now
                };
                _context.DichVus.Add(dichVu);
                _context.SaveChanges();

                _logger.LogInformation($"Created new service: {newMaDichVu}");

                return new JsonResult(new
                {
                    message = "Thêm dịch vụ thành công.",
                    dichVu = newMaDichVu
                })
                {
                    StatusCode = StatusCodes.Status201Created
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating service");
                return new JsonResult($"Lỗi khi tạo dịch vụ: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
        public JsonResult UpdateDichVu(string MaDichVu, UpdateDichVuDTO updateDichVu)
        {
            try
            {
                var dichVu = _context.DichVus.FirstOrDefault(dv => dv.MaDichVu == MaDichVu);
                if (dichVu == null)
                {
                    return new JsonResult("Không tìm thấy dịch vụ với mã đã cho.")
                    {
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                string thumbnailUrl = dichVu.Thumbnail ?? "";
                bool thumbnailChanged = false;

                // Kiểm tra xem có ThumbnailUrl được gửi từ form không (giữ nguyên URL cũ)
                string thumbnailUrlFromForm = "";
                if (_httpContextAccessor.HttpContext != null && 
                    _httpContextAccessor.HttpContext.Request.Form.TryGetValue("ThumbnailUrl", out var value))
                {
                    thumbnailUrlFromForm = value.ToString();
                }
                if (!string.IsNullOrEmpty(thumbnailUrlFromForm))
                {
                    _logger.LogInformation($"Sử dụng URL từ form: {thumbnailUrlFromForm}");
                    thumbnailUrl = thumbnailUrlFromForm;
                    thumbnailChanged = false;
                }
                // Nếu có file mới được upload
                else if (updateDichVu.Thumbnail != null)
                {
                    try
                    {
                        _logger.LogInformation($"Bắt đầu cập nhật file: {updateDichVu.Thumbnail.FileName}, Size: {updateDichVu.Thumbnail.Length} bytes");
                        
                        // Delete old thumbnail if exists
                        if (!string.IsNullOrEmpty(dichVu.Thumbnail))
                        {
                            _logger.LogInformation($"Xóa file cũ: {dichVu.Thumbnail}");
                            var deleteResult = _fileRepository.DeleteFileAsync(dichVu.Thumbnail).Result;
                            _logger.LogInformation($"Kết quả xóa file cũ: {(deleteResult ? "Thành công" : "Thất bại")}");
                        }

                        // Upload new thumbnail
                        var uploadResult = _fileRepository.WriteFileAsync(updateDichVu.Thumbnail, "services").Result;
                        thumbnailUrl = uploadResult;
                        thumbnailChanged = true;
                        
                        _logger.LogInformation($"Upload thành công, URL mới: {thumbnailUrl}");
                        
                        // Kiểm tra URL trả về
                        if (string.IsNullOrEmpty(thumbnailUrl))
                        {
                            _logger.LogWarning("URL trả về rỗng sau khi upload");
                            return new JsonResult("Không thể upload hình ảnh. URL trả về rỗng.")
                            {
                                StatusCode = StatusCodes.Status500InternalServerError
                            };
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi khi cập nhật file");
                        return new JsonResult($"Lỗi khi cập nhật file: {ex.Message}")
                        {
                            StatusCode = StatusCodes.Status500InternalServerError
                        };
                    }
                }
                // Nếu không có file upload mới và không có URL từ form, giữ nguyên thumbnailUrl hiện tại
                else
                {
                    _logger.LogInformation($"Không có file mới, giữ nguyên URL cũ: {thumbnailUrl}");
                }

                dichVu.TenDichVu = updateDichVu.TenDichVu;
                dichVu.Thumbnail = thumbnailUrl;
                dichVu.MoTa = updateDichVu.MoTa;
                dichVu.DonGia = updateDichVu.DonGia;
                dichVu.NgaySua = DateTime.Now;

                _context.SaveChanges();

                _logger.LogInformation($"Updated service: {MaDichVu}");

                return new JsonResult(new
                {
                    message = "Cập nhật dịch vụ thành công.",
                    dichVu = MaDichVu
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating service {MaDichVu}");
                return new JsonResult($"Lỗi khi cập nhật dịch vụ: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
        public JsonResult DeleteDichVu(string MaDichVu)
        {
            try
            {
                var dichVu = _context.DichVus.FirstOrDefault(dv => dv.MaDichVu == MaDichVu);
                if (dichVu == null)
                {
                    return new JsonResult("Không tìm thấy dịch vụ với mã đã cho.")
                    {
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                // Delete thumbnail from Supabase if exists
                if (!string.IsNullOrEmpty(dichVu.Thumbnail))
                {
                    _ = _fileRepository.DeleteFileAsync(dichVu.Thumbnail);
                }

                _context.DichVus.Remove(dichVu);
                _context.SaveChanges();

                _logger.LogInformation($"Deleted service: {MaDichVu}");

                return new JsonResult(new
                {
                    message = "Xóa dịch vụ thành công.",
                    dichVu = MaDichVu
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting service {MaDichVu}");
                return new JsonResult($"Lỗi khi xóa dịch vụ: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
    }
}