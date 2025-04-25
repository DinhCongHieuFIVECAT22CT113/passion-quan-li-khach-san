using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLKS.Data;
using QLKS.Models;
using QLKS.DTOs;

namespace QLKS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatPhongController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DatPhongController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/DatPhong
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DatPhongDTO>>> GetDatPhongs()
        {
            return await _context.DatPhongs
                .Select(dp => new DatPhongDTO
                {
                    MaDatPhong = dp.MaDatPhong,
                    MaKH = dp.MaKH,
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
                })
                .ToListAsync();
        }

        // GET: api/DatPhong/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DatPhongDTO>> GetDatPhong(string id)
        {
            var datPhong = await _context.DatPhongs
                .Where(dp => dp.MaDatPhong == id)
                .Select(dp => new DatPhongDTO
                {
                    MaDatPhong = dp.MaDatPhong,
                    MaKH = dp.MaKH,
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
                })
                .FirstOrDefaultAsync();

            if (datPhong == null)
            {
                return NotFound();
            }

            return datPhong;
        }

        // PUT: api/DatPhong/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDatPhong(string id, DatPhongDTO datPhongDTO)
        {
            if (id != datPhongDTO.MaDatPhong)
            {
                return BadRequest();
            }

            var datPhong = await _context.DatPhongs.FindAsync(id);
            if (datPhong == null)
            {
                return NotFound();
            }

            datPhong.MaKH = datPhongDTO.MaKH;
            datPhong.TreEm = datPhongDTO.TreEm;
            datPhong.NguoiLon = datPhongDTO.NguoiLon;
            datPhong.GhiChu = datPhongDTO.GhiChu;
            datPhong.SoLuongPhong = datPhongDTO.SoLuongPhong;
            datPhong.ThoiGianDen = datPhongDTO.ThoiGianDen;
            datPhong.NgayNhanPhong = datPhongDTO.NgayNhanPhong;
            datPhong.NgayTraPhong = datPhongDTO.NgayTraPhong;
            datPhong.TrangThai = datPhongDTO.TrangThai;
            datPhong.GiaGoc = datPhongDTO.GiaGoc;
            datPhong.TongTien = datPhongDTO.TongTien;
            datPhong.NgaySua = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DatPhongExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/DatPhong
        [HttpPost]
        public async Task<ActionResult<DatPhongDTO>> PostDatPhong(DatPhongDTO datPhongDTO)
        {
            var datPhong = new DatPhong
            {
                MaDatPhong = datPhongDTO.MaDatPhong,
                MaKH = datPhongDTO.MaKH,
                TreEm = datPhongDTO.TreEm,
                NguoiLon = datPhongDTO.NguoiLon,
                GhiChu = datPhongDTO.GhiChu,
                SoLuongPhong = datPhongDTO.SoLuongPhong,
                ThoiGianDen = datPhongDTO.ThoiGianDen,
                NgayNhanPhong = datPhongDTO.NgayNhanPhong,
                NgayTraPhong = datPhongDTO.NgayTraPhong,
                TrangThai = datPhongDTO.TrangThai,
                GiaGoc = datPhongDTO.GiaGoc,
                TongTien = datPhongDTO.TongTien,
                NgayTao = DateTime.Now,
                NgaySua = DateTime.Now
            };

            _context.DatPhongs.Add(datPhong);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (DatPhongExists(datPhong.MaDatPhong))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetDatPhong", new { id = datPhong.MaDatPhong }, datPhongDTO);
        }

        // DELETE: api/DatPhong/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDatPhong(string id)
        {
            var datPhong = await _context.DatPhongs.FindAsync(id);
            if (datPhong == null)
            {
                return NotFound();
            }

            _context.DatPhongs.Remove(datPhong);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DatPhongExists(string id)
        {
            return _context.DatPhongs.Any(e => e.MaDatPhong == id);
        }
    }
} 