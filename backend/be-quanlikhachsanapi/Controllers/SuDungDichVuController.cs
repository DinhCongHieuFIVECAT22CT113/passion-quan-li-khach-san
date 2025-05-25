using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;
using System.Linq;
using System.Threading.Tasks;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SuDungDichVuController : ControllerBase
    {
        private readonly ISuDungDichVuRepository _suDungDichVuRepo;

        public SuDungDichVuController(ISuDungDichVuRepository suDungDichVuRepo)
        {
            _suDungDichVuRepo = suDungDichVuRepo;
        }

        /// <summary>
        /// Lấy danh sách tất cả dịch vụ đã sử dụng
        /// </summary>
        [HttpGet]
        [RequireRole("R00", "R01", "R02")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAll()
        {
            var suDungDichVus = await _suDungDichVuRepo.GetAllAsync();
            if (suDungDichVus == null || !suDungDichVus.Any())
            {
                return NotFound("Không tìm thấy thông tin sử dụng dịch vụ nào.");
            }
            return Ok(suDungDichVus);
        }

        /// <summary>
        /// Lấy thông tin sử dụng dịch vụ theo mã
        /// </summary>
        [HttpGet("{maSuDung}")]
        [RequireRole("R00", "R01", "R02")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(string maSuDung)
        {
            var suDungDichVu = await _suDungDichVuRepo.GetByIdAsync(maSuDung);
            if (suDungDichVu == null)
            {
                return NotFound($"Không tìm thấy thông tin sử dụng dịch vụ với mã {maSuDung}");
            }
            return Ok(suDungDichVu);
        }

        /// <summary>
        /// Lấy danh sách dịch vụ đã sử dụng theo mã đặt phòng
        /// </summary>
        [HttpGet("theo-dat-phong/{maDatPhong}")]
        [RequireRole("R00", "R01", "R02")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByDatPhong(string maDatPhong)
        {
            var suDungDichVus = await _suDungDichVuRepo.GetByDatPhongAsync(maDatPhong);
            if (suDungDichVus == null || !suDungDichVus.Any())
            {
                return NotFound($"Không tìm thấy thông tin sử dụng dịch vụ nào cho đặt phòng {maDatPhong}");
            }
            return Ok(suDungDichVus);
        }

        /// <summary>
        /// Tạo mới thông tin sử dụng dịch vụ
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromForm] CreateSuDungDichVuDTO createDto)
        {
            try
            {
                var maSuDung = await _suDungDichVuRepo.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { maSuDung }, new { MaSuDung = maSuDung, Message = "Tạo thông tin sử dụng dịch vụ thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật thông tin sử dụng dịch vụ
        /// </summary>
        [HttpPut("{maSuDung}")]
        [Consumes("multipart/form-data")]
        [RequireRole("R00", "R01", "R02")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(string maSuDung, [FromForm] UpdateSuDungDichVuDTO updateDto)
        {
            try
            {
                var result = await _suDungDichVuRepo.UpdateAsync(maSuDung, updateDto);
                if (!result)
                {
                    return NotFound($"Không tìm thấy thông tin sử dụng dịch vụ với mã {maSuDung}");
                }
                return Ok(new { Message = "Cập nhật thông tin sử dụng dịch vụ thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Xóa thông tin sử dụng dịch vụ
        /// </summary>
        [HttpDelete("{maSuDung}")]
        [RequireRole("R00", "R01")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(string maSuDung)
        {
            var result = await _suDungDichVuRepo.DeleteAsync(maSuDung);
            if (!result)
            {
                return NotFound($"Không tìm thấy thông tin sử dụng dịch vụ với mã {maSuDung}");
            }
            return Ok(new { Message = "Xóa thông tin sử dụng dịch vụ thành công" });
        }

        /// <summary>
        /// Update trạng thái sử dụng dịch vụ
        /// </summary>
        [HttpPut("update-trang-thai/{maSuDung}")]
        [RequireRole("R00", "R01", "R02")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateTrangThai(string maSuDung, [FromBody] string trangThai)
        {
            var result = await _suDungDichVuRepo.UpdateTrangThaiAsync(maSuDung, trangThai);
            if (!result)
            {
                return NotFound($"Không tìm thấy thông tin sử dụng dịch vụ với mã {maSuDung}");
            }
            return Ok(new { Message = "Cập nhật trạng thái sử dụng dịch vụ thành công" });
        }
    }
}

