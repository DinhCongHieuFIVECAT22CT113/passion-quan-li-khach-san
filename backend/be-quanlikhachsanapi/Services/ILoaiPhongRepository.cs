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
        private readonly DataQlks113Nhom2Context _context;
        private readonly IWriteFileRepository _fileRepository;
        private readonly ILogger<DichVuRepository> _logger;

        public LoaiPhongRepository(DataQlks113Nhom2Context context, IWriteFileRepository fileRepository, ILogger<DichVuRepository> logger)
        {
            _context = context;
            _fileRepository = fileRepository;
            _logger = logger;
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
            try
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
                string thumbnailUrl = "";
                // Handle file upload if Thumbnail is provided
                if (createLoaiPhong.Thumbnail != null)
                {
                    var uploadResult = _fileRepository.WriteFileAsync(createLoaiPhong.Thumbnail, "roomtypes").Result;
                    thumbnailUrl = uploadResult;
                }
                else
                {
                    return new JsonResult("Thumbnail là bắt buộc.")
                    {
                        StatusCode = StatusCodes.Status400BadRequest
                    };
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
                    Thumbnail = thumbnailUrl,
                    NgayTao = DateTime.Now,
                    NgaySua = DateTime.Now
                };
                _context.LoaiPhongs.Add(loaiPhong);
                _context.SaveChanges();

                _logger.LogInformation($"Created new room type: {newMaLoaiPhong}");


                return new JsonResult(new
                {
                    message = "Thêm loại phòng thành công.",
                    loaiPhong = newMaLoaiPhong
                })
                {
                    StatusCode = StatusCodes.Status201Created
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating room type");
                return new JsonResult($"Lỗi khi tạo loại phòng: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
        public JsonResult UpdateLoaiPhong(string MaLoaiPhong, UpdateLoaiPhongDTO updateLoaiPhong)
        {
            try
            {
                var loaiPhong = _context.LoaiPhongs.FirstOrDefault(lp => lp.MaLoaiPhong == MaLoaiPhong);
                if (loaiPhong == null)
                {
                    return new JsonResult("Không tìm thấy loại phòng với mã đã cho.")
                    {
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                string thumbnailUrl = loaiPhong.Thumbnail ?? "";

                // Handle file upload if Thumbnail is provided
                if (updateLoaiPhong.Thumbnail != null)
                {
                    // Delete old thumbnail if exists
                    if (!string.IsNullOrEmpty(loaiPhong.Thumbnail))
                    {
                        _ = _fileRepository.DeleteFileAsync(loaiPhong.Thumbnail);
                    }

                    // Upload new thumbnail
                    var uploadResult = _fileRepository.WriteFileAsync(updateLoaiPhong.Thumbnail, "roomtypes").Result;
                    thumbnailUrl = uploadResult;
                }
                // Nếu không có file upload mới, giữ nguyên thumbnailUrl hiện tại

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
                loaiPhong.Thumbnail = thumbnailUrl;
                loaiPhong.NgaySua = DateTime.Now;

                _context.SaveChanges();

                _logger.LogInformation($"Updated room type: {MaLoaiPhong}");

                return new JsonResult(new
                {
                    message = "Cập nhật loại phòng thành công.",
                    maLoaiPhong = MaLoaiPhong
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating room type {MaLoaiPhong}");
                return new JsonResult($"Lỗi khi cập nhật loại phòng: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
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