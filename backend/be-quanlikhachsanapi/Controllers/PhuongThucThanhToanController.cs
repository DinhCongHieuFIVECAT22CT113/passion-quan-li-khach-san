using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhuongThucThanhToanController : ControllerBase
    {
        private readonly IPhuongThucThanhToanRepository _phuongThucRepo;

        public PhuongThucThanhToanController(IPhuongThucThanhToanRepository phuongThucRepo)
        {
            _phuongThucRepo = phuongThucRepo;
        }

        /// <summary>
        /// Lấy danh sách tất cả phương thức thanh toán
        /// </summary>
        [HttpGet]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var phuongThucs = await _phuongThucRepo.GetAllAsync();
                if (phuongThucs == null || !phuongThucs.Any())
                {
                    return NotFound("Không tìm thấy phương thức thanh toán nào.");
                }
                return Ok(phuongThucs);
            }
            catch (Exception ex)
            {
                // Log lỗi
                Console.WriteLine($"Lỗi khi lấy danh sách phương thức thanh toán: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                // Trả về lỗi chi tiết (chỉ nên dùng trong môi trường development)
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        /// <summary>
        /// Lấy thông tin phương thức thanh toán theo mã
        /// </summary>
        [HttpGet("{maPhuongThucThanhToan}")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(string maPhuongThucThanhToan)
        {
            var phuongThuc = await _phuongThucRepo.GetByIdAsync(maPhuongThucThanhToan);
            if (phuongThuc == null)
            {
                return NotFound($"Không tìm thấy phương thức thanh toán với mã {maPhuongThucThanhToan}");
            }
            return Ok(phuongThuc);
        }

        /// <summary>
        /// Lấy danh sách phương thức thanh toán theo mã hóa đơn
        /// </summary>
        [HttpGet("HoaDon/{maHoaDon}")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByHoaDon(string maHoaDon)
        {
            var phuongThucs = await _phuongThucRepo.GetByHoaDonAsync(maHoaDon);
            if (phuongThucs == null || !phuongThucs.Any())
            {
                return NotFound($"Không tìm thấy phương thức thanh toán nào cho hóa đơn {maHoaDon}");
            }
            return Ok(phuongThucs);
        }

        /// <summary>
        /// Tạo mới phương thức thanh toán
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromForm] CreatePhuongThucThanhToanDTO createDto)
        {
            try
            {
                var maPhuongThuc = await _phuongThucRepo.CreateAsync(createDto);
                var phuongThuc = await _phuongThucRepo.GetByIdAsync(maPhuongThuc);
                return CreatedAtAction(nameof(GetById), new { maPhuongThucThanhToan = maPhuongThuc }, phuongThuc);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật thông tin phương thức thanh toán
        /// </summary>
        [HttpPut("{maPhuongThucThanhToan}")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(string maPhuongThucThanhToan, [FromForm] UpdatePhuongThucThanhToanDTO updateDto)
        {
            try
            {
                var result = await _phuongThucRepo.UpdateAsync(maPhuongThucThanhToan, updateDto);
                if (!result)
                {
                    return NotFound($"Không tìm thấy phương thức thanh toán với mã {maPhuongThucThanhToan}");
                }
                var phuongThuc = await _phuongThucRepo.GetByIdAsync(maPhuongThucThanhToan);
                return Ok(phuongThuc);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật trạng thái phương thức thanh toán
        /// </summary>
        [HttpPut("{maPhuongThucThanhToan}/trangThai")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateTrangThai(string maPhuongThucThanhToan, string trangThai)
        {
            var result = await _phuongThucRepo.UpdateTrangThaiAsync(maPhuongThucThanhToan, trangThai);
            if (!result)
            {
                return NotFound($"Không tìm thấy phương thức thanh toán với mã {maPhuongThucThanhToan}");
            }
            var phuongThuc = await _phuongThucRepo.GetByIdAsync(maPhuongThucThanhToan);
            return Ok(phuongThuc);
        }

        /// <summary>
        /// Xóa phương thức thanh toán
        /// </summary>
        [HttpDelete("{maPhuongThucThanhToan}")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(string maPhuongThucThanhToan)
        {
            var result = await _phuongThucRepo.DeleteAsync(maPhuongThucThanhToan);
            if (!result)
            {
                return NotFound($"Không tìm thấy phương thức thanh toán với mã {maPhuongThucThanhToan}");
            }
            return Ok(new { Message = $"Đã xóa phương thức thanh toán với mã {maPhuongThucThanhToan}" });
        }
    }
}
