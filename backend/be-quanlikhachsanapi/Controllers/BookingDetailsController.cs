using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Authorization; // Sẽ cần cho các thao tác sau này
using System;

namespace be_quanlikhachsanapi.Controllers
{
    [ApiController]
    [Route("api/dat-phong/{maDatPhong}/chi-tiet")] // Đổi route cơ sở
    // [Authorize] // Bỏ comment khi muốn bảo vệ API này
    public class ChiTietDatPhongController : ControllerBase
    {
        private readonly QuanLyKhachSanContext _context;

        public ChiTietDatPhongController(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        // --- API Quản lý Dịch vụ --- 

        [HttpPost("dich-vu")]
        public async Task<IActionResult> ThemDichVuVaoDatPhong(string maDatPhong, [FromBody] ThemDichVuVaoDatPhongDto dto)
        {
            var datPhong = await _context.DatPhongs.FindAsync(maDatPhong);
            if (datPhong == null) return NotFound("Đặt phòng không tồn tại.");

            var dichVu = await _context.DichVus.FindAsync(dto.MaDichVu);
            if (dichVu == null) return NotFound("Dịch vụ không tồn tại.");
            
            // DonGia là non-nullable, không cần ??
            decimal donGiaDichVu = dichVu.DonGia; 

            var suDungDichVu = new SuDungDichVu
            {
                MaSuDung = TaoMaSuDungDichVu(),
                MaDatPhong = maDatPhong,
                MaDichVu = dto.MaDichVu,
                SoLuong = dto.SoLuong,
                TongTien = donGiaDichVu * dto.SoLuong, 
                NgaySuDung = DateTime.UtcNow,
                TrangThai = "Đã thêm"
            };

            _context.SuDungDichVus.Add(suDungDichVu);
            await _context.SaveChangesAsync();

            return Ok(suDungDichVu);
        }

        [HttpGet("dich-vu")]
        public async Task<IActionResult> LayDichVuDatPhong(string maDatPhong)
        {
            var datPhongExists = await _context.DatPhongs.AnyAsync(dp => dp.MaDatPhong == maDatPhong);
            if (!datPhongExists) return NotFound("Đặt phòng không tồn tại.");

            var services = await _context.SuDungDichVus
                                     .Where(sd => sd.MaDatPhong == maDatPhong)
                                     .Include(sd => sd.MaDichVuNavigation)
                                     .Select(sd => new
                                     {
                                         sd.MaSuDung,
                                         sd.MaDichVu,
                                         TenDichVu = sd.MaDichVuNavigation != null ? sd.MaDichVuNavigation.TenDichVu : null,
                                         // DonGia là non-nullable
                                         DonGia = sd.MaDichVuNavigation != null ? sd.MaDichVuNavigation.DonGia : 0m, // Trả về 0 nếu navigation là null
                                         sd.SoLuong,
                                         sd.TongTien,
                                         sd.NgaySuDung
                                     })
                                     .ToListAsync();
            return Ok(services);
        }

        // TODO: Thêm API DELETE service (nếu cần)
        // [HttpDelete("services/{maSuDungDv}")]
        // public async Task<IActionResult> RemoveServiceFromBooking(string maDatPhong, string maSuDungDv){...}

        // --- API Quản lý Khuyến mãi ---

        [HttpPost("khuyen-mai")]
        public async Task<IActionResult> ApDungKhuyenMaiChoDatPhong(string maDatPhong, [FromBody] ApDungKhuyenMaiChoDatPhongDto dto)
        {
            var datPhong = await _context.DatPhongs.FindAsync(maDatPhong);
            if (datPhong == null) return NotFound("Đặt phòng không tồn tại.");

            var khuyenMai = await _context.KhuyenMais.FindAsync(dto.MaKhuyenMai);
            if (khuyenMai == null) return NotFound("Khuyến mãi không tồn tại.");

            if (khuyenMai.NgayBatDau > DateTime.UtcNow || khuyenMai.NgayKetThuc < DateTime.UtcNow)
            {
                return BadRequest("Khuyến mãi không hợp lệ hoặc đã hết hạn.");
            }

            var daApDung = await _context.ApDungKms.AnyAsync(ad => ad.MaDatPhong == maDatPhong && ad.MaKm == dto.MaKhuyenMai);
            if (daApDung) return BadRequest("Khuyến mãi này đã được áp dụng.");

            decimal soTienGiamCalc = TinhTienGiamGia(datPhong, khuyenMai);

            var apDungKm = new ApDungKm
            {
                MaApDung = TaoMaApDungKhuyenMai(),
                MaDatPhong = maDatPhong,
                MaKm = dto.MaKhuyenMai,
                SoTienGiam = soTienGiamCalc 
            };

            _context.ApDungKms.Add(apDungKm);
            await _context.SaveChangesAsync();

            return Ok(apDungKm);
        }

        [HttpGet("khuyen-mai")]
        public async Task<IActionResult> LayKhuyenMaiDatPhong(string maDatPhong)
        {
            var datPhongExists = await _context.DatPhongs.AnyAsync(dp => dp.MaDatPhong == maDatPhong);
            if (!datPhongExists) return NotFound("Đặt phòng không tồn tại.");

            var promotions = await _context.ApDungKms
                                    .Where(ad => ad.MaDatPhong == maDatPhong)
                                    .Include(ad => ad.MaKmNavigation)
                                    .Select(ad => new
                                    {
                                        ad.MaApDung,
                                        MaKhuyenMai = ad.MaKm,
                                        TenKhuyenMai = ad.MaKmNavigation != null ? ad.MaKmNavigation.TenKhuyenMai : null,
                                        MoTa = ad.MaKmNavigation != null ? ad.MaKmNavigation.MoTa : null,
                                        ad.SoTienGiam
                                    })
                                    .ToListAsync();
            return Ok(promotions);
        }

        // TODO: Thêm API DELETE promotion (nếu cần)
        // [HttpDelete("promotions/{maApDung}")]
        // public async Task<IActionResult> RemovePromotionFromBooking(string maDatPhong, string maApDung){...}

        // --- Helper methods --- 
        private string TaoMaSuDungDichVu()
        {
            return "SD" + DateTime.Now.Ticks.ToString().Substring(0, 8);
        }

        private string TaoMaApDungKhuyenMai()
        {
            return "AD" + DateTime.Now.Ticks.ToString().Substring(0, 8);
        }

        private decimal TinhTienGiamGia(DatPhong datPhong, KhuyenMai khuyenMai)
        {
            // GiaGoc là non-nullable, không cần ??
            decimal giaGocDatPhong = datPhong.GiaGoc; 
            decimal discount = 0;

            if (khuyenMai.PhanTramGiam > 0)
            {
                discount = giaGocDatPhong * ((decimal)khuyenMai.PhanTramGiam / 100m);
                if (khuyenMai.SoTienGiam > 0 && discount > khuyenMai.SoTienGiam)
                {
                    discount = khuyenMai.SoTienGiam;
                }
            }
            else if (khuyenMai.SoTienGiam > 0)
            {
                discount = khuyenMai.SoTienGiam;
            }

            return Math.Min(discount, giaGocDatPhong);
        }
    }
} 