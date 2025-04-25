using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLKS.Data;
using QLKS.Models;
using QLKS.DTOs;

namespace QLKS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChiTietDatPhongController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChiTietDatPhongController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ChiTietDatPhong
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChiTietDatPhongDTO>>> GetChiTietDatPhongs()
        {
            return await _context.ChiTietDatPhongs
                .Select(ct => new ChiTietDatPhongDTO
                {
                    MaChiTietDatPhong = ct.MaChiTietDatPhong,
                    MaDatPhong = ct.MaDatPhong,
                    MaLoaiPhong = ct.MaLoaiPhong,
                    MaPhong = ct.MaPhong,
                    SoDem = ct.SoDem,
                    GiaTien = ct.GiaTien,
                    ThanhTien = ct.ThanhTien,
                    TrangThai = ct.TrangThai
                })
                .ToListAsync();
        }

        // GET: api/ChiTietDatPhong/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ChiTietDatPhongDTO>> GetChiTietDatPhong(string id)
        {
            var chiTietDatPhong = await _context.ChiTietDatPhongs
                .Where(ct => ct.MaChiTietDatPhong == id)
                .Select(ct => new ChiTietDatPhongDTO
                {
                    MaChiTietDatPhong = ct.MaChiTietDatPhong,
                    MaDatPhong = ct.MaDatPhong,
                    MaLoaiPhong = ct.MaLoaiPhong,
                    MaPhong = ct.MaPhong,
                    SoDem = ct.SoDem,
                    GiaTien = ct.GiaTien,
                    ThanhTien = ct.ThanhTien,
                    TrangThai = ct.TrangThai
                })
                .FirstOrDefaultAsync();

            if (chiTietDatPhong == null)
            {
                return NotFound();
            }

            return chiTietDatPhong;
        }

        // PUT: api/ChiTietDatPhong/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutChiTietDatPhong(string id, ChiTietDatPhongDTO chiTietDatPhongDTO)
        {
            if (id != chiTietDatPhongDTO.MaChiTietDatPhong)
            {
                return BadRequest();
            }

            var chiTietDatPhong = await _context.ChiTietDatPhongs.FindAsync(id);
            if (chiTietDatPhong == null)
            {
                return NotFound();
            }

            chiTietDatPhong.MaDatPhong = chiTietDatPhongDTO.MaDatPhong;
            chiTietDatPhong.MaLoaiPhong = chiTietDatPhongDTO.MaLoaiPhong;
            chiTietDatPhong.MaPhong = chiTietDatPhongDTO.MaPhong;
            chiTietDatPhong.SoDem = chiTietDatPhongDTO.SoDem;
            chiTietDatPhong.GiaTien = chiTietDatPhongDTO.GiaTien;
            chiTietDatPhong.ThanhTien = chiTietDatPhongDTO.ThanhTien;
            chiTietDatPhong.TrangThai = chiTietDatPhongDTO.TrangThai;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChiTietDatPhongExists(id))
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

        // POST: api/ChiTietDatPhong
        [HttpPost]
        public async Task<ActionResult<ChiTietDatPhongDTO>> PostChiTietDatPhong(ChiTietDatPhongDTO chiTietDatPhongDTO)
        {
            var chiTietDatPhong = new ChiTietDatPhong
            {
                MaChiTietDatPhong = chiTietDatPhongDTO.MaChiTietDatPhong,
                MaDatPhong = chiTietDatPhongDTO.MaDatPhong,
                MaLoaiPhong = chiTietDatPhongDTO.MaLoaiPhong,
                MaPhong = chiTietDatPhongDTO.MaPhong,
                SoDem = chiTietDatPhongDTO.SoDem,
                GiaTien = chiTietDatPhongDTO.GiaTien,
                ThanhTien = chiTietDatPhongDTO.ThanhTien,
                TrangThai = chiTietDatPhongDTO.TrangThai
            };

            _context.ChiTietDatPhongs.Add(chiTietDatPhong);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ChiTietDatPhongExists(chiTietDatPhong.MaChiTietDatPhong))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetChiTietDatPhong", new { id = chiTietDatPhong.MaChiTietDatPhong }, chiTietDatPhongDTO);
        }

        // DELETE: api/ChiTietDatPhong/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChiTietDatPhong(string id)
        {
            var chiTietDatPhong = await _context.ChiTietDatPhongs.FindAsync(id);
            if (chiTietDatPhong == null)
            {
                return NotFound();
            }

            _context.ChiTietDatPhongs.Remove(chiTietDatPhong);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ChiTietDatPhongExists(string id)
        {
            return _context.ChiTietDatPhongs.Any(e => e.MaChiTietDatPhong == id);
        }
    }
} 