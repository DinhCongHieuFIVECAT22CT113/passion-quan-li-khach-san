using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Security.Claims;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HoaDonController : ControllerBase
    {
        private readonly IHoaDonRepository _hoaDonRepo;

        public HoaDonController(IHoaDonRepository hoaDonRepo)
        {
            _hoaDonRepo = hoaDonRepo;
        }

        /// <summary>
        /// Lấy danh sách tất cả hóa đơn
        /// </summary>
        [HttpGet]
        [RequireRole("R00", "R01", "R02", "R03")]  // Thêm R03 cho kế toán
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAll()
        {
            var hoaDons = await _hoaDonRepo.GetAllAsync();
            if (hoaDons == null || !hoaDons.Any())
            {
                return NotFound("Không tìm thấy hóa đơn nào.");
            }
            return Ok(hoaDons);
        }

        /// <summary>
        /// Lấy thông tin hóa đơn theo mã
        /// </summary>        [HttpGet("{maHoaDon}")]
        [RequireRole("R00", "R01", "R02", "R03", "R04")]  // Thêm R03 cho kế toán
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(string maHoaDon)
        {
            var hoaDon = await _hoaDonRepo.GetByIdAsync(maHoaDon);
            if (hoaDon == null)
            {
                return NotFound($"Không tìm thấy hóa đơn với mã {maHoaDon}");
            }
            return Ok(hoaDon);
        }

        /// <summary>
        /// Lấy thông tin hóa đơn theo mã đặt phòng
        /// </summary>
        [HttpGet("datphong/{maDatPhong}")]
        [RequireRole("R00", "R01", "R02", "R04")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByDatPhong(string maDatPhong)
        {
            var hoaDon = await _hoaDonRepo.GetByDatPhongAsync(maDatPhong);
            if (hoaDon == null)
            {
                return NotFound($"Không tìm thấy hóa đơn với mã đặt phòng {maDatPhong}");
            }
            return Ok(hoaDon);
        }

        /// <summary>
        /// Tạo mới hóa đơn        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02", "R03")]  // Thêm R03 cho kế toán
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromForm] CreateHoaDonDTO createDto)
        {
            try
            {
                var maHoaDon = await _hoaDonRepo.CreateAsync(createDto);
                var hoaDon = await _hoaDonRepo.GetByIdAsync(maHoaDon);
                return CreatedAtAction(nameof(GetById), new { maHoaDon }, hoaDon);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật thông tin hóa đơn        /// </summary>
        [HttpPut("{maHoaDon}")]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02", "R03")]  // Thêm R03 cho kế toán
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(string maHoaDon, [FromForm] UpdateHoaDonDTO updateDto)
        {
            try
            {
                var result = await _hoaDonRepo.UpdateAsync(maHoaDon, updateDto);
                if (!result)
                {
                    return NotFound($"Không tìm thấy hóa đơn với mã {maHoaDon}");
                }
                var hoaDon = await _hoaDonRepo.GetByIdAsync(maHoaDon);
                return Ok(hoaDon);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật trạng thái hóa đơn
        /// </summary>        [HttpPut("{maHoaDon}/trangthai")]
        [RequireRole("R00", "R01", "R02", "R03")]  // Thêm R03 cho kế toán
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTrangThai(string maHoaDon, [FromBody] UpdateTrangThaiDTO trangThaiDto)
        {
            var result = await _hoaDonRepo.UpdateTrangThaiAsync(maHoaDon, trangThaiDto.TrangThai);
            if (!result)
            {
                return NotFound($"Không tìm thấy hóa đơn với mã {maHoaDon}");
            }
            var hoaDon = await _hoaDonRepo.GetByIdAsync(maHoaDon);
            return Ok(hoaDon);
        }

        /// <summary>
        /// Xóa hóa đơn
        /// </summary>
        [HttpDelete("{maHoaDon}")]
        [RequireRole("R00", "R01")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(string maHoaDon)
        {
            var result = await _hoaDonRepo.DeleteAsync(maHoaDon);
            if (!result)
            {
                return NotFound($"Không tìm thấy hóa đơn với mã {maHoaDon}");
            }
            return Ok(new { Message = $"Đã xóa hóa đơn với mã {maHoaDon}" });
        }

        /// <summary>
        /// Tính tổng doanh thu theo tháng và năm
        /// </summary>
        [HttpGet("doanhthu")]
        [RequireRole("R00", "R01")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> TinhTongDoanhThu([FromQuery] int thang, [FromQuery] int nam)
        {
            var tongDoanhThu = await _hoaDonRepo.TinhTongDoanhThuAsync(thang, nam);
            return Ok(new { Thang = thang, Nam = nam, TongDoanhThu = tongDoanhThu });
        }
    }
}