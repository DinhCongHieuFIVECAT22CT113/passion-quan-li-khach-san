using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;

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

        public DichVuRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public List<DichVuDTO> GetAll()
        {
            var dichVus = _context.DichVus.ToList();
            return dichVus.Select(dv => new DichVuDTO
            {
                MaDichVu = dv.MaDichVu,
                TenDichVu = dv.TenDichVu,
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
                MoTa = dichVu.MoTa,
                DonGia = dichVu.DonGia
            };
            return new JsonResult(_dichVu) { StatusCode = 200 };
        }
        public JsonResult CreateDichVu(CreateDichVuDTO createDichVu)
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
            var dichVu = new DichVu
            {
                MaDichVu = newMaDichVu,
                TenDichVu = createDichVu.TenDichVu,
                MoTa = createDichVu.MoTa,
                DonGia = createDichVu.DonGia,
                NgayTao = DateTime.Now,
                NgaySua = DateTime.Now
            };
            _context.DichVus.Add(dichVu);
            _context.SaveChanges();
             return new JsonResult(new
            {
                message = "Thêm dịch vụ thành công.",
                dichVu = newMaDichVu
            })
            {
                StatusCode = StatusCodes.Status201Created
            };
        }
        public JsonResult UpdateDichVu(string MaDichVu, UpdateDichVuDTO updateDichVu)
        {
            var dichVu = _context.DichVus.FirstOrDefault(dv => dv.MaDichVu == MaDichVu);
            if (dichVu == null)
            {
                return new JsonResult("Không tìm thấy dịch vụ với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {        
                dichVu.TenDichVu = updateDichVu.TenDichVu;
                dichVu.MoTa = updateDichVu.MoTa;
                dichVu.DonGia = updateDichVu.DonGia;
                dichVu.NgaySua = DateTime.Now;

                _context.SaveChanges();
                return new JsonResult(new
                {
                    message = "Cập nhật dịch vụ thành công.",
                    dichVu = MaDichVu
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
        }
        public JsonResult DeleteDichVu(string MaDichVu)
        {
            var dichVu = _context.DichVus.FirstOrDefault(dv => dv.MaDichVu == MaDichVu);
            if (dichVu == null)
            {
                return new JsonResult("Không tìm thấy dịch vụ với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {
                _context.DichVus.Remove(dichVu);
                _context.SaveChanges();
                return new JsonResult(new
                {
                    message = "Xóa dịch vụ thành công.",
                    dichVu = MaDichVu
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
        }
    }
}