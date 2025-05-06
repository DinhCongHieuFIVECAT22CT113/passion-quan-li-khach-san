using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
    }
}