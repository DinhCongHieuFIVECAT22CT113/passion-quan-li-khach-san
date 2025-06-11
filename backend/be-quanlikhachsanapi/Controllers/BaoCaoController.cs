using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class BaoCaoController : ControllerBase
    {
        private readonly IBaoCaoRepository _baoCaoRepo;

        public BaoCaoController(IBaoCaoRepository baoCaoRepo)
        {
            _baoCaoRepo = baoCaoRepo;
        }
        /// <summary>
        /// Lấy danh sách tất cả báo cáo
        /// /// </summary>
        [HttpGet]
        [AllowAnonymous]
        [Authorize]
        [RequireRole("R00", "R01", "R02", "R05")]
        public IActionResult GetAll()
        {
            var baoCaos = _baoCaoRepo.GetAll();
            if (baoCaos == null || baoCaos.Count == 0)
            {
                return NotFound("Không tìm thấy báo cáo nào.");
            }
            return Ok(baoCaos);
        }
        /// <summary>
        /// Lấy báo cáo theo ID
        /// /// </summary>
        [HttpGet("{maBaoCao}")]
        [AllowAnonymous]
        [Authorize]
        [RequireRole("R00", "R01", "R02", "R05")]
        public IActionResult GetByID(string maBaoCao)
        {
            var baoCao = _baoCaoRepo.GetBaoCaoById(maBaoCao);
            if (baoCao == null)
            {
                return NotFound("Không tìm thấy báo cáo với ID đã cho.");
            }
            return Ok(baoCao);
        }
        /// <summary>
        /// Tạo báo cáo mới
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R05")]
        public IActionResult CreateBaoCao([FromForm] CreateBaoCaoDoanhThuDTO createBaoCao)
        {
            var baoCao = _baoCaoRepo.CreateBaoCao(createBaoCao);
            if (baoCao == null)
            {
                return BadRequest("Không thể tạo báo cáo mới.");
            }
            return Ok(baoCao);
        }
        /// <summary>
        /// Cập nhật báo cáo
        /// </summary>
        [HttpPut("{maBaoCao}")]
        [Consumes("multipart/form-data")]
        [Authorize]
        [RequireRole("R05")]
        public IActionResult UpdateBaoCao(string maBaoCao, [FromForm] UpdateBaoCaoDoanhThuDTO updateBaoCao)
        {
            var baoCao = _baoCaoRepo.UpdateBaoCao(maBaoCao, updateBaoCao);
            if (baoCao == null)
            {
                return NotFound("Không tìm thấy báo cáo với ID đã cho.");
            }
            return Ok(baoCao);
        }
        /// <summary>
        /// Xóa báo cáo
        /// </summary>
        [HttpDelete("{maBaoCao}")]
        [Authorize]
        [RequireRole("R00", "R01", "R02", "R05")]
        public IActionResult DeleteBaoCao(string maBaoCao)
        {
            var baoCao = _baoCaoRepo.DeleteBaoCao(maBaoCao);
            if (baoCao == null)
            {
                return NotFound("Không tìm thấy báo cáo với ID đã cho.");
            }
            return Ok(baoCao);
        }
    }
}
