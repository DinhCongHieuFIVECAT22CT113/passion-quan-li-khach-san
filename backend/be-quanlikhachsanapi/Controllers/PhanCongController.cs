using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhanCongController : ControllerBase
    {
        private readonly IPhanCongCaRepository _phanCongCaRepo;

        public PhanCongController(IPhanCongCaRepository phanCongCaRepo)
        {
            _phanCongCaRepo = phanCongCaRepo;
        }

        [HttpPost("Giao ca làm")]
        [Consumes("multipart/form-data")]
        public IActionResult GiaoCaLam([FromForm] CreatePhanCongDTO createPhanCongDto)
        {
            var result = _phanCongCaRepo.GiaoCaLam(createPhanCongDto);
            if (result.StatusCode == 400)
            {
                return BadRequest(result.Value);
            }
            return Ok(result.Value);
        }
        [HttpPut("Update ca làm")]
        [Consumes("multipart/form-data")]
        public IActionResult UpdateCaLam([FromForm] UpdatePhanCongDTO updatePhanCongDto)
        {
            var result = _phanCongCaRepo.UpdateCaLam(updatePhanCongDto);
            if (result.StatusCode == 400)
            {
                return BadRequest(result.Value);
            }
            return Ok(result.Value);
        }
    }
}