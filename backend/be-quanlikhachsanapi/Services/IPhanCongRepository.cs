using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Services
{
    public interface IPhanCongCaRepository
    {
        JsonResult GiaoCaLam(CreatePhanCongDTO createPhanCongDto);
        JsonResult UpdateCaLam(UpdatePhanCongDTO updatePhanCongDto);
        JsonResult GetLichLamViecByNhanVien(string maNv);
    }

    public class PhanCongCaRepository : IPhanCongCaRepository
    {
        private readonly QuanLyKhachSanContext _context;

        public PhanCongCaRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public JsonResult GiaoCaLam(CreatePhanCongDTO createPhanCongDto)
        {
            var exists = _context.PhanCongs.Any(p =>
                p.MaNv == createPhanCongDto.MaNv &&
                p.MaCaLam == createPhanCongDto.MaCaLam &&
                p.NgayLam == createPhanCongDto.NgayLam
            );

            if (exists)
            {
                return new JsonResult("Nhân viên đã được phân công ca này trong ngày.") { StatusCode = 400 };
            }

            var lastPhanCong = _context.PhanCongs
                .OrderByDescending(clv => clv.MaPhanCong)
                .FirstOrDefault();

            string newMaPhanCong;

            if (lastPhanCong == null || string.IsNullOrEmpty(lastPhanCong. MaPhanCong))
            {
                newMaPhanCong = "PC01";
            }
            else
            {
                int lastNumber = int.Parse(lastPhanCong.MaPhanCong.Substring(3));
                newMaPhanCong = "PC" + (lastNumber + 1).ToString("D2");
            }
                
            var phanCong = new PhanCong
            {
                MaPhanCong = newMaPhanCong,
                MaNv = createPhanCongDto.MaNv,
                MaCaLam = createPhanCongDto.MaCaLam,
                NgayLam = createPhanCongDto.NgayLam
            };

            _context.PhanCongs.Add(phanCong);
            _context.SaveChanges();

            return new JsonResult(new { message = "Phân công ca thành công." }) { StatusCode = 201 };
        }

        public JsonResult UpdateCaLam(UpdatePhanCongDTO updatePhanCongDto)
        {
            var phanCong = _context.PhanCongs.FirstOrDefault(p =>
                p.MaNv == updatePhanCongDto.MaNv 
            );

            if (phanCong == null)
            {
                return new JsonResult("Không tìm thấy phân công ca.") { StatusCode = 404 };
            }

            phanCong.MaCaLam = updatePhanCongDto.MaCaLam;
            phanCong.NgayLam = updatePhanCongDto.NgayLam;
            _context.SaveChanges();

            return new JsonResult(new { message = "Cập nhật ca làm thành công." }) { StatusCode = 200 };
        }

        public JsonResult GetLichLamViecByNhanVien(string maNv)
        {
            var lich = (from pc in _context.PhanCongs
                    join clv in _context.CaLamViecs on pc.MaCaLam equals clv.MaCaLam
                    where pc.MaNv == maNv
                    select new LichLamViecDto
                    {
                        MaNv = pc.MaNv,
                        TenCaLam = clv.TenCaLam,
                        NgayLam = pc.NgayLam.ToDateTime(TimeOnly.MinValue)
                    }).ToList();

            if (lich.Count == 0)
            {
                return new JsonResult("Không tìm thấy lịch làm việc") { StatusCode = 400 };
            }

            return new JsonResult(lich) { StatusCode = 200 };
        }
    }
}
