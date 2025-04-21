using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLKS.Data;
using QLKS.Models;
using QLKS.DTOs;

namespace QLKS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhongController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PhongController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Phong
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PhongDTO>>> GetPhongs()
        {
            return await _context.Phongs
                .Select(p => new PhongDTO
                {
                    MaPhong = p.MaPhong,
                    MaLoaiPhong = p.MaLoaiPhong,
                    SoPhong = p.SoPhong,
                    Thumbnail = p.Thumbnail,
                    HinhAnh = p.HinhAnh,
                    TrangThai = p.TrangThai,
                    Tang = p.Tang,
                    NgayTao = p.NgayTao,
                    NgaySua = p.NgaySua
                })
                .ToListAsync();
        }

        // GET: api/Phong/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PhongDTO>> GetPhong(string id)
        {
            var phong = await _context.Phongs
                .Where(p => p.MaPhong == id)
                .Select(p => new PhongDTO
                {
                    MaPhong = p.MaPhong,
                    MaLoaiPhong = p.MaLoaiPhong,
                    SoPhong = p.SoPhong,
                    Thumbnail = p.Thumbnail,
                    HinhAnh = p.HinhAnh,
                    TrangThai = p.TrangThai,
                    Tang = p.Tang,
                    NgayTao = p.NgayTao,
                    NgaySua = p.NgaySua
                })
                .FirstOrDefaultAsync();

            if (phong == null)
            {
                return NotFound();
            }

            return phong;
        }

        // PUT: api/Phong/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPhong(string id, PhongDTO phongDTO)
        {
            if (id != phongDTO.MaPhong)
            {
                return BadRequest();
            }

            var phong = await _context.Phongs.FindAsync(id);
            if (phong == null)
            {
                return NotFound();
            }

            phong.MaLoaiPhong = phongDTO.MaLoaiPhong;
            phong.SoPhong = phongDTO.SoPhong;
            phong.Thumbnail = phongDTO.Thumbnail;
            phong.HinhAnh = phongDTO.HinhAnh;
            phong.TrangThai = phongDTO.TrangThai;
            phong.Tang = phongDTO.Tang;
            phong.NgaySua = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PhongExists(id))
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

        // POST: api/Phong
        [HttpPost]
        public async Task<ActionResult<PhongDTO>> PostPhong(PhongDTO phongDTO)
        {
            var phong = new Phong
            {
                MaPhong = phongDTO.MaPhong,
                MaLoaiPhong = phongDTO.MaLoaiPhong,
                SoPhong = phongDTO.SoPhong,
                Thumbnail = phongDTO.Thumbnail,
                HinhAnh = phongDTO.HinhAnh,
                TrangThai = phongDTO.TrangThai,
                Tang = phongDTO.Tang,
                NgayTao = DateTime.Now,
                NgaySua = DateTime.Now
            };

            _context.Phongs.Add(phong);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (PhongExists(phong.MaPhong))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetPhong", new { id = phong.MaPhong }, phongDTO);
        }

        // DELETE: api/Phong/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhong(string id)
        {
            var phong = await _context.Phongs.FindAsync(id);
            if (phong == null)
            {
                return NotFound();
            }

            _context.Phongs.Remove(phong);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PhongExists(string id)
        {
            return _context.Phongs.Any(e => e.MaPhong == id);
        }
    }
} 