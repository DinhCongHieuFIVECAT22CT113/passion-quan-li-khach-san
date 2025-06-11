using be_quanlikhachsanapi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using be_quanlikhachsanapi.Authorization;
using System.Linq;

namespace be_quanlikhachsanapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoleController : ControllerBase
    {
        private readonly DataQlks113Nhom2Context _context;

        public RoleController(DataQlks113Nhom2Context context)
        {
            _context = context;
        }

        // Lấy tất cả role
        [HttpGet]
        [RequireRole("R00", "R01")]
        public IActionResult GetAll()
        {
            var roles = _context.Roles.ToList();
            if (roles == null || roles.Count == 0)
            {
                return NotFound("Không tìm thấy role nào.");
            }
            return Ok(roles);
        }

        // Lấy role theo mã
        [HttpGet("{maRole}")]
        [RequireRole("R00", "R01", "R02")]
        public IActionResult GetById(string maRole)
        {
            var role = _context.Roles.FirstOrDefault(r => r.MaRole == maRole);
            if (role == null)
            {
                return NotFound($"Không tìm thấy role với mã {maRole}");
            }
            return Ok(role);
        }
    }
}
