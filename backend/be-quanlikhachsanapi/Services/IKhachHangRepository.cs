using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using be_quanlikhachsanapi.ViewModel;
using be_quanlikhachsanapi.Helpers;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;
using Google.Apis.Gmail.v1.Data;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace be_quanlikhachsanapi.Services
{
    public interface IKhachHangRepository
    {
        List<KhachHangDto> GetAll();
        JsonResult GetKhachHangById(string MaKh);
        JsonResult CreateKhachHang(CreateKhachHangDto createKhachHang);
        JsonResult UpdateKhachHang(string MaKh, UpdateKhachHangDto updateKhachHang);
        JsonResult DeleteKhachHang(string MaKh);
        //JsonResult ResetPassword(string UserName);
    }
    public class KhachHangRepository : IKhachHangRepository
    {
        private readonly QuanLyKhachSanContext _context;
        private readonly IPasswordHasher<KhachHang> _passwordHasher;
        private readonly ISendEmailServices _sendEmail;
        private readonly IConfiguration _confMail;
        
        public KhachHangRepository(QuanLyKhachSanContext context, IPasswordHasher<KhachHang> passwordHasher, ISendEmailServices sendEmail, IConfiguration confMail)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _sendEmail = sendEmail;
            _confMail = confMail;
        }

        public List<KhachHangDto> GetAll()
        {
            var khachHangs = _context.KhachHangs.ToList();
            return khachHangs.Select(kh => new KhachHangDto
            {
                MaKh = kh.MaKh,
                UserName = kh.UserName,
                HoKh = kh.HoKh,
                TenKh = kh.TenKh,
                Email = kh.Email,
                Sdt = kh.Sdt,
                DiaChi = kh.DiaChi,
                SoCccd = kh.SoCccd,
                MaLoaiKh = kh.MaLoaiKh,
                MaRole = kh.MaRole,
            }).ToList();
        }

        public JsonResult GetKhachHangById(string MaKh)
        {
            var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.MaKh == MaKh);
            if (khachHang == null)
            {
                return new JsonResult("Không tìm thấy khách hàng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            var _khachHang = new KhachHangDto
            {
                MaKh = khachHang.MaKh,
                UserName = khachHang.UserName,
                HoKh = khachHang.HoKh,
                TenKh = khachHang.TenKh,
                Email = khachHang.Email,
                Sdt = khachHang.Sdt,
                DiaChi = khachHang.DiaChi,
                SoCccd = khachHang.SoCccd,
                MaLoaiKh = khachHang.MaLoaiKh,
                MaRole = khachHang.MaRole,
            };
            return new JsonResult(_khachHang);
        }

        public JsonResult CreateKhachHang(CreateKhachHangDto createKhachHang)
        {
            // Kiểm tra trùng UserName
            if (_context.KhachHangs.Any(kh => kh.UserName == createKhachHang.UserName))
            {
                return new JsonResult(new
                {
                    message = "Username đã tồn tại",
                    username = createKhachHang.UserName
                })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            // Tạo mã khách hàng tự động
            var lastKhachHang = _context.KhachHangs
                .OrderByDescending(kh => kh.MaKh)
                .FirstOrDefault();
            string newMaKh;
            if (lastKhachHang == null)
            {
                newMaKh = "KH001";
            }
            else
            {
                int lastNumber = int.Parse(lastKhachHang.MaKh.Substring(2));
                newMaKh = "KH" + (lastNumber + 1).ToString("D3");
            }

            // Sinh mật khẩu ngẫu nhiên
            string password = Guid.NewGuid().ToString("N").Substring(0, 6); // Generate a random password

            var khachHang = new KhachHang
            {
                MaKh = newMaKh,
                UserName = createKhachHang.UserName,
                HoKh = createKhachHang.HoKh,
                TenKh = createKhachHang.TenKh,
                Email = createKhachHang.Email,
                Sdt = createKhachHang.Sdt,
                DiaChi = createKhachHang.DiaChi,
                SoCccd = createKhachHang.SoCccd,
                MaLoaiKh = "LKH001",
                MaRole = "R04",
                NgayTao = DateTime.Now,
                NgaySua = DateTime.Now
            };

            #pragma warning disable CS8601
            khachHang.PasswordHash = _passwordHasher.HashPassword(khachHang, password);
            #pragma warning restore CS8601

            _context.KhachHangs.Add(khachHang);
            _context.SaveChanges();

            // Gửi email thông báo tài khoản
            var email = new EmailModel
            {
                ToEmail = createKhachHang.Email,
                Subject = "Tài khoản của bạn đã được khởi tạo bởi quản trị viên",
                Body = $"Thông tin đăng nhập:\n- Username: {createKhachHang.UserName}\n- Mật khẩu: {password}"
            };
            _sendEmail.SendEmail(email);

            return new JsonResult("Đã khởi tạo khách hàng thành công")
            {
                StatusCode = StatusCodes.Status201Created
            };
        }

        public JsonResult UpdateKhachHang(string MaKh, UpdateKhachHangDto updateKhachHang)
        {
            var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.MaKh == MaKh);
            if (khachHang == null)
            {
                return new JsonResult("Không tìm thấy khách hàng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            khachHang.Email = updateKhachHang.Email;
            khachHang.Sdt = updateKhachHang.Sdt;
            khachHang.DiaChi = updateKhachHang.DiaChi;
            khachHang.SoCccd = updateKhachHang.SoCccd;
            khachHang.MaLoaiKh = updateKhachHang.MaLoaiKh;
            khachHang.NgaySua = DateTime.Now;

            _context.SaveChanges();

            return new JsonResult("Đã cập nhật khách hàng thành công")
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        public JsonResult DeleteKhachHang(string MaKh)
        {
            var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.MaKh == MaKh);
            if (khachHang == null)
            {
                return new JsonResult("Không tìm thấy khách hàng với mã đã cho.")
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            _context.KhachHangs.Remove(khachHang);
            _context.SaveChanges();

            return new JsonResult("Đã xóa khách hàng thành công")
            {
                StatusCode = StatusCodes.Status200OK
            };
        }

        // public JsonResult ResetPassword(string userName)
        // {
        //     var khachHang = _context.KhachHangs.FirstOrDefault(kh => kh.UserName == userName);
        //     if (khachHang == null)
        //     {
        //         return new JsonResult("Không tìm thấy khách hàng với username đã cho.")
        //         {
        //             StatusCode = StatusCodes.Status404NotFound
        //         };
        //     }

        //     // Sinh mật khẩu ngẫu nhiên
        //     string password = Guid.NewGuid().ToString("N").Substring(0, 6); // Generate a random password

        //     // Cập nhật mật khẩu mới
        //     khachHang.PasswordHash = _passwordHasher.HashPassword(khachHang, password);
        //     _context.SaveChanges();

        //     // Gửi email xác nhận
        //     var email = new EmailModel
        //     {
        //         ToEmail = khachHang.Email,
        //         Subject = "Mật khẩu đăng nhập đã được khôi phục",
        //         Body = $"Mật khẩu mới của bạn là: {password}"
        //     };
        //     _sendEmail.SendEmail(email);

        //     return new JsonResult("Đã khôi phục mật khẩu thành công.")
        //     {
        //         StatusCode = StatusCodes.Status200OK
        //     };
        // }
    }
}