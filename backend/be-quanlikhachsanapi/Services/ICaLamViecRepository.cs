using System.Diagnostics.Contracts;
using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Services
{
    public interface ICaLamViecRepository
    {
        List<CaLamViecDTO> GetAll();
        JsonResult GetCaLamViecById(string MaCaLam);
        JsonResult CreateCaLamViec(CreateCaLamViecDTO createCaLamViec);
        JsonResult UpdateCaLamViec(string MaCaLam, UpdateCaLamViecDTO updateCaLamViec);
        JsonResult DeleteCaLamViec(string MaCaLam);
    }
    public class CaLamViecRepository : ICaLamViecRepository
    {
        private readonly QuanLyKhachSanContext _context;

        public CaLamViecRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public List<CaLamViecDTO> GetAll()
        {
            var caLamViecs = _context.CaLamViecs.ToList();
            return caLamViecs.Select(clv => new CaLamViecDTO
            {
                MaCaLam = clv.MaCaLam,
                TenCaLam = clv.TenCaLam,
                GioBatDau = clv.GioBatDau,
                GioKetThuc = clv.GioKetThuc
            }).ToList();
        }
        public JsonResult GetCaLamViecById(string MaCaLam)
        {
            var caLamViec = _context.CaLamViecs.FirstOrDefault(clv => clv.MaCaLam == MaCaLam);
            if (caLamViec == null)
            {
                return new JsonResult(null) { StatusCode = 404 };
            }
            var _caLamViec = new CaLamViecDTO
            {
                MaCaLam = caLamViec.MaCaLam,
                TenCaLam = caLamViec.TenCaLam,
                GioBatDau = caLamViec.GioBatDau,
                GioKetThuc = caLamViec.GioKetThuc
            };
            return new JsonResult(_caLamViec) { StatusCode = 200 };
        }
        public JsonResult CreateCaLamViec(CreateCaLamViecDTO createCaLamViec)
        {
            var lastCaLamViec = _context.CaLamViecs
                .OrderByDescending(clv => clv.MaCaLam)
                .FirstOrDefault();

            string newMaCaLam;

            if (lastCaLamViec == null || string.IsNullOrEmpty(lastCaLamViec.MaCaLam))
            {
                newMaCaLam = "CLV01";
            }
            else
            {
                int lastNumber = int.Parse(lastCaLamViec.MaCaLam.Substring(3));
                newMaCaLam = "CLV" + (lastNumber + 1).ToString("D2");
            }

            var caLamViec = new CaLamViec
            {
                MaCaLam = newMaCaLam,
                TenCaLam = createCaLamViec.TenCaLam,
                GioBatDau = createCaLamViec.GioBatDau,
                GioKetThuc = createCaLamViec.GioKetThuc
            };

            _context.CaLamViecs.Add(caLamViec);
            _context.SaveChanges();

            return new JsonResult(new
            {
                message = "Thêm ca làm thành công.",
                caLamViec = newMaCaLam
            })
            {
                StatusCode = StatusCodes.Status201Created
            };
        }
        public JsonResult UpdateCaLamViec(string MaCaLam, UpdateCaLamViecDTO updateCaLamViec)
        {
            var caLamViec = _context.CaLamViecs.FirstOrDefault(clv => clv.MaCaLam == MaCaLam);
            if (caLamViec == null)
            {
                return new JsonResult("Không tìm thấy ca làm với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            else
            {
                caLamViec.TenCaLam = updateCaLamViec.TenCaLam;
                caLamViec.GioBatDau = updateCaLamViec.GioBatDau;
                caLamViec.GioKetThuc = updateCaLamViec.GioKetThuc;
                _context.SaveChanges();
            }

                _context.CaLamViecs.Update(caLamViec);
                _context.SaveChanges();

            return new JsonResult(new
                {
                    message = "Cập nhật ca làm thành công.",
                    caLamViec = MaCaLam
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
           
        public JsonResult DeleteCaLamViec(string MaCaLam)
        {
            var caLamViec = _context.CaLamViecs.FirstOrDefault(clv => clv.MaCaLam == MaCaLam);
            if (caLamViec == null)
            {
                return new JsonResult("Không tìm thấy ca làm với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            else
            {
                _context.CaLamViecs.Remove(caLamViec);
                _context.SaveChanges();
                return new JsonResult(new
                {
                    message = "Xóa ca làm thành công.",
                    caLamViec = MaCaLam
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
        }
    }
}