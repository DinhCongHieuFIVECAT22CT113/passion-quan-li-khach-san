using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLKS.Data;
using QLKS.Models;
using QLKS.DTOs;

namespace QLKS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoaiPhongController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LoaiPhongController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/LoaiPhong
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LoaiPhongDTO>>> GetLoaiPhongs()
        {
            return await _context.LoaiPhongs
                .Select(lp => new LoaiPhongDTO
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
                    Thumbnail = lp.Thumbnail,
                    HinhAnh = lp.HinhAnh,
                    NgayTao = lp.NgayTao,
                    NgaySua = lp.NgaySua
                })
                .ToListAsync();
        }

        // GET: api/LoaiPhong/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LoaiPhongDTO>> GetLoaiPhong(string id)
        {
            var loaiPhong = await _context.LoaiPhongs
                .Where(lp => lp.MaLoaiPhong == id)
                .Select(lp => new LoaiPhongDTO
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
                    Thumbnail = lp.Thumbnail,
                    HinhAnh = lp.HinhAnh,
                    NgayTao = lp.NgayTao,
                    NgaySua = lp.NgaySua
                })
                .FirstOrDefaultAsync();

            if (loaiPhong == null)
            {
                return NotFound();
            }

            return loaiPhong;
        }

        // PUT: api/LoaiPhong/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLoaiPhong(string id, LoaiPhongDTO loaiPhongDTO)
        {
            if (id != loaiPhongDTO.MaLoaiPhong)
            {
                return BadRequest();
            }

            var loaiPhong = await _context.LoaiPhongs.FindAsync(id);
            if (loaiPhong == null)
            {
                return NotFound();
            }

            loaiPhong.TenLoaiPhong = loaiPhongDTO.TenLoaiPhong;
            loaiPhong.MoTa = loaiPhongDTO.MoTa;
            loaiPhong.GiaMoiGio = loaiPhongDTO.GiaMoiGio;
            loaiPhong.GiaMoiDem = loaiPhongDTO.GiaMoiDem;
            loaiPhong.SoPhongTam = loaiPhongDTO.SoPhongTam;
            loaiPhong.SoGiuongNgu = loaiPhongDTO.SoGiuongNgu;
            loaiPhong.GiuongDoi = loaiPhongDTO.GiuongDoi;
            loaiPhong.GiuongDon = loaiPhongDTO.GiuongDon;
            loaiPhong.KichThuocPhong = loaiPhongDTO.KichThuocPhong;
            loaiPhong.SucChua = loaiPhongDTO.SucChua;
            loaiPhong.Thumbnail = loaiPhongDTO.Thumbnail;
            loaiPhong.HinhAnh = loaiPhongDTO.HinhAnh;
            loaiPhong.NgaySua = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LoaiPhongExists(id))
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

        // POST: api/LoaiPhong
        [HttpPost]
        public async Task<ActionResult<LoaiPhongDTO>> PostLoaiPhong(LoaiPhongDTO loaiPhongDTO)
        {
            var loaiPhong = new LoaiPhong
            {
                MaLoaiPhong = loaiPhongDTO.MaLoaiPhong,
                TenLoaiPhong = loaiPhongDTO.TenLoaiPhong,
                MoTa = loaiPhongDTO.MoTa,
                GiaMoiGio = loaiPhongDTO.GiaMoiGio,
                GiaMoiDem = loaiPhongDTO.GiaMoiDem,
                SoPhongTam = loaiPhongDTO.SoPhongTam,
                SoGiuongNgu = loaiPhongDTO.SoGiuongNgu,
                GiuongDoi = loaiPhongDTO.GiuongDoi,
                GiuongDon = loaiPhongDTO.GiuongDon,
                KichThuocPhong = loaiPhongDTO.KichThuocPhong,
                SucChua = loaiPhongDTO.SucChua,
                Thumbnail = loaiPhongDTO.Thumbnail,
                HinhAnh = loaiPhongDTO.HinhAnh,
                NgayTao = DateTime.Now,
                NgaySua = DateTime.Now
            };

            _context.LoaiPhongs.Add(loaiPhong);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (LoaiPhongExists(loaiPhong.MaLoaiPhong))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetLoaiPhong", new { id = loaiPhong.MaLoaiPhong }, loaiPhongDTO);
        }

        // DELETE: api/LoaiPhong/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLoaiPhong(string id)
        {
            var loaiPhong = await _context.LoaiPhongs.FindAsync(id);
            if (loaiPhong == null)
            {
                return NotFound();
            }

            _context.LoaiPhongs.Remove(loaiPhong);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LoaiPhongExists(string id)
        {
            return _context.LoaiPhongs.Any(e => e.MaLoaiPhong == id);
        }
    }
} 