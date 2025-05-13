using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApDungKMController : ControllerBase
    {
        private readonly IApDungKMRepository _apDungKMRepo;

        public ApDungKMController(IApDungKMRepository apDungKMRepo)
        {
            _apDungKMRepo = apDungKMRepo;
        }

        /// <summary>
        /// Lấy danh sách tất cả áp dụng khuyến mãi
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAll()
        {
            var apDungKMs = await _apDungKMRepo.GetAllAsync();
            if (apDungKMs == null || !apDungKMs.Any())
            {
                return NotFound("Không tìm thấy thông tin áp dụng khuyến mãi nào.");
            }
            return Ok(apDungKMs);
        }

        /// <summary>
        /// Lấy thông tin áp dụng khuyến mãi theo mã
        /// </summary>
        [HttpGet("{maApDung}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(string maApDung)
        {
            var apDungKM = await _apDungKMRepo.GetByIdAsync(maApDung);
            if (apDungKM == null)
            {
                return NotFound($"Không tìm thấy thông tin áp dụng khuyến mãi với mã {maApDung}");
            }
            return Ok(apDungKM);
        }

        /// <summary>
        /// Lấy danh sách áp dụng khuyến mãi theo mã đặt phòng
        /// </summary>
        [HttpGet("theo-dat-phong/{maDatPhong}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByDatPhong(string maDatPhong)
        {
            var apDungKMs = await _apDungKMRepo.GetByDatPhongAsync(maDatPhong);
            if (apDungKMs == null || !apDungKMs.Any())
            {
                return NotFound($"Không tìm thấy thông tin áp dụng khuyến mãi nào cho đặt phòng {maDatPhong}");
            }
            return Ok(apDungKMs);
        }

        /// <summary>
        /// Tạo mới thông tin áp dụng khuyến mãi
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromForm] CreateApDungKMDTO createDto)
        {
            try
            {
                var maApDung = await _apDungKMRepo.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { maApDung }, new { MaApDung = maApDung, Message = "Tạo thông tin áp dụng khuyến mãi thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật thông tin áp dụng khuyến mãi
        /// </summary>
        [HttpPut("{maApDung}")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(string maApDung, [FromForm] UpdateApDungKMDTO updateDto)
        {
            try
            {
                var result = await _apDungKMRepo.UpdateAsync(maApDung, updateDto);
                if (!result)
                {
                    return NotFound($"Không tìm thấy thông tin áp dụng khuyến mãi với mã {maApDung}");
                }
                return Ok(new { Message = "Cập nhật thông tin áp dụng khuyến mãi thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Xóa thông tin áp dụng khuyến mãi
        /// </summary>
        [HttpDelete("{maApDung}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(string maApDung)
        {
            var result = await _apDungKMRepo.DeleteAsync(maApDung);
            if (!result)
            {
                return NotFound($"Không tìm thấy thông tin áp dụng khuyến mãi với mã {maApDung}");
            }
            return Ok(new { Message = "Xóa thông tin áp dụng khuyến mãi thành công" });
        }
    }
}