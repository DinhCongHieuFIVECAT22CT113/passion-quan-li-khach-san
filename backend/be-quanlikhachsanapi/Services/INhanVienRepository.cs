using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace be_quanlikhachsanapi.Services
{
    public interface INhanVienRepository
    {
        List<NhanVienDTO> GetAll();
        JsonResult GetNhanVienById(string MaNv);
        JsonResult CreateNhanVien(CreateNhanVienDTO createNhanVien);
        JsonResult UpdateNhanVien(string MaNv, UpdateNhanVienDTO updateNhanVien);
        JsonResult DeleteNhanVien(string MaNv);
    }
    public class NhanVienRepository : INhanVienRepository
    {
        private readonly QuanLyKhachSanContext _context;
        private readonly IPasswordHasher<NhanVien> _passwordHasher;
        public NhanVienRepository(QuanLyKhachSanContext context, IPasswordHasher<NhanVien> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public List<NhanVienDTO> GetAll()
        {
            var nhanViens = _context.NhanViens.ToList();
            return nhanViens.Select(nv => new NhanVienDTO
            {
                MaNv = nv.MaNv,
                UserName = nv.UserName,
                HoNv = nv.HoNv,
                TenNv = nv.TenNv,
                ChucVu = nv.ChucVu,
                Email = nv.Email,
                Sdt = nv.Sdt,
                LuongCoBan = nv.LuongCoBan,
                NgayVaoLam = nv.NgayVaoLam,
                MaRole = nv.MaRole,
            }).ToList();
        }

        public JsonResult GetNhanVienById(string MaNv)
        {
            var nhanVien = _context.NhanViens.FirstOrDefault(nv => nv.MaNv == MaNv);
            if (nhanVien == null)
            {
                return new JsonResult("Không tìm thấy nhân viên với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            var _nhanVien = new NhanVienDTO
            {
                MaNv = nhanVien.MaNv,
                UserName = nhanVien.UserName,
                HoNv = nhanVien.HoNv,
                TenNv = nhanVien.TenNv,
                ChucVu = nhanVien.ChucVu,
                Email = nhanVien.Email,
                Sdt = nhanVien.Sdt,
                LuongCoBan = nhanVien.LuongCoBan,
                NgayVaoLam = nhanVien.NgayVaoLam,
                MaRole = nhanVien.MaRole,
            };
            return new JsonResult(_nhanVien) { StatusCode = 200 };
        }

        public JsonResult CreateNhanVien(CreateNhanVienDTO createNhanVien)
        {
            try
            {
                // Kiểm tra username đã tồn tại
                var existingUser = _context.NhanViens.FirstOrDefault(nv => nv.UserName == createNhanVien.UserName);
                if (existingUser != null)
                {
                    return new JsonResult("Username đã tồn tại.")
                    {
                        StatusCode = StatusCodes.Status409Conflict
                    };
                }

                // Kiểm tra email đã tồn tại
                var existingEmail = _context.NhanViens.FirstOrDefault(nv => nv.Email == createNhanVien.Email);
                if (existingEmail != null)
                {
                    return new JsonResult("Email đã tồn tại.")
                    {
                        StatusCode = StatusCodes.Status409Conflict
                    };
                }

                var lastNhanVien = _context.NhanViens
                    .OrderByDescending(nv => nv.MaNv)
                    .FirstOrDefault();

                string newMaNv;

                if (lastNhanVien == null || string.IsNullOrEmpty(lastNhanVien.MaNv))
                {
                    newMaNv = "NV01";
                }
                else
                {
                    int lastNumber = int.Parse(lastNhanVien.MaNv.Substring(2));
                    newMaNv = "NV" + (lastNumber + 1).ToString("D2");
                }

                var nhanVien = new NhanVien
                {
                    MaNv = newMaNv,
                    UserName = createNhanVien.UserName,
                    HoNv = createNhanVien.HoNv,
                    TenNv = createNhanVien.TenNv,
                    ChucVu = createNhanVien.ChucVu,
                    Email = createNhanVien.Email,
                    Sdt = createNhanVien.Sdt,
                    LuongCoBan = createNhanVien.LuongCoBan,
                    NgayVaoLam = createNhanVien.NgayVaoLam,
                    MaRole = createNhanVien.MaRole,
                    NgayTao = DateTime.Now
                };
                #pragma warning disable CS8601
                nhanVien.PasswordHash = _passwordHasher.HashPassword(nhanVien, createNhanVien.Password);
                #pragma warning restore CS8601

                _context.NhanViens.Add(nhanVien);
                _context.SaveChanges();

                return new JsonResult(new
                {
                    message = "Thêm nhân viên thành công.",
                    nhanVien = newMaNv
                })
                {
                    StatusCode = StatusCodes.Status201Created
                };
            }
            catch (Exception ex)
            {
                return new JsonResult($"Lỗi khi tạo nhân viên: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public JsonResult UpdateNhanVien(string MaNv, UpdateNhanVienDTO updateNhanVien)
        {
            try
            {
                var nhanVien = _context.NhanViens.FirstOrDefault(nv => nv.MaNv == MaNv);
                if (nhanVien == null)
                {
                    return new JsonResult("Không tìm thấy nhân viên với mã đã cho.")
                    {
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                // Kiểm tra email đã tồn tại (ngoại trừ nhân viên hiện tại)
                var existingEmail = _context.NhanViens.FirstOrDefault(nv => nv.Email == updateNhanVien.Email && nv.MaNv != MaNv);
                if (existingEmail != null)
                {
                    return new JsonResult("Email đã tồn tại.")
                    {
                        StatusCode = StatusCodes.Status409Conflict
                    };
                }

                nhanVien.ChucVu = updateNhanVien.ChucVu;
                nhanVien.Email = updateNhanVien.Email;
                nhanVien.Sdt = updateNhanVien.Sdt;
                nhanVien.LuongCoBan = updateNhanVien.LuongCoBan;
                nhanVien.MaRole = updateNhanVien.MaRole;
                nhanVien.NgaySua = DateTime.Now;

                _context.SaveChanges();

                return new JsonResult(new
                {
                    message = "Cập nhật nhân viên thành công.",
                    nhanVien = MaNv
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                return new JsonResult($"Lỗi khi cập nhật nhân viên: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public JsonResult DeleteNhanVien(string MaNv)
        {
            var nhanVien = _context.NhanViens.FirstOrDefault(nv => nv.MaNv == MaNv);
            if (nhanVien == null)
            {
                return new JsonResult("Không tìm thấy nhân viên với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            try
            {
                // Kiểm tra xem nhân viên có đang được tham chiếu không
                var hasBaoCao = _context.BaoCaoDoanhThus.Any(bc => bc.MaNv == MaNv);
                var hasPhanCong = _context.PhanCongs.Any(pc => pc.MaNv == MaNv);

                if (hasBaoCao || hasPhanCong)
                {
                    return new JsonResult("Không thể xóa nhân viên này. Nhân viên đang được tham chiếu trong hệ thống (báo cáo doanh thu hoặc phân công).")
                    {
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                _context.NhanViens.Remove(nhanVien);
                _context.SaveChanges();

                return new JsonResult(new
                {
                    message = "Xóa nhân viên thành công.",
                    nhanVien = MaNv
                })
                {
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                return new JsonResult($"Lỗi khi xóa nhân viên: {ex.Message}")
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
    }
}