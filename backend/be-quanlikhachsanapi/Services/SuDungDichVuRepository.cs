using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.EntityFrameworkCore;

namespace be_quanlikhachsanapi.Services
{
    public class SuDungDichVuRepository : ISuDungDichVuRepository
    {
        private readonly QuanLyKhachSanContext _context;

        public SuDungDichVuRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public async Task<List<SuDungDichVuDTO>> GetAllAsync()
        {
            return await _context.SuDungDichVus
                .Include(s => s.MaDichVuNavigation)
                .Select(s => new SuDungDichVuDTO
                {
                    MaSuDung = s.MaSuDung,
                    MaDatPhong = s.MaDatPhong,
                    MaDichVu = s.MaDichVu,
                    SoLuong = s.SoLuong,
                    TongTien = s.TongTien,
                    NgaySuDung = s.NgaySuDung,
                    TrangThai = s.TrangThai,
                    TenDichVu = s.MaDichVuNavigation.TenDichVu,
                    DonGia = s.MaDichVuNavigation.DonGia
                })
                .ToListAsync();
        }

        public async Task<SuDungDichVuDTO> GetByIdAsync(string maSuDung)
        {
            var suDungDichVu = await _context.SuDungDichVus
                .Include(s => s.MaDichVuNavigation)
                .FirstOrDefaultAsync(s => s.MaSuDung == maSuDung);

            if (suDungDichVu == null)
            {
                return null;
            }

            return new SuDungDichVuDTO
            {
                MaSuDung = suDungDichVu.MaSuDung,
                MaDatPhong = suDungDichVu.MaDatPhong,
                MaDichVu = suDungDichVu.MaDichVu,
                SoLuong = suDungDichVu.SoLuong,
                TongTien = suDungDichVu.TongTien,
                NgaySuDung = suDungDichVu.NgaySuDung,
                TrangThai = suDungDichVu.TrangThai,
                TenDichVu = suDungDichVu.MaDichVuNavigation?.TenDichVu,
                DonGia = suDungDichVu.MaDichVuNavigation?.DonGia
            };
        }

        public async Task<List<SuDungDichVuDTO>> GetByDatPhongAsync(string maDatPhong)
        {
            return await _context.SuDungDichVus
                .Include(s => s.MaDichVuNavigation)
                .Where(s => s.MaDatPhong == maDatPhong)
                .Select(s => new SuDungDichVuDTO
                {
                    MaSuDung = s.MaSuDung,
                    MaDatPhong = s.MaDatPhong,
                    MaDichVu = s.MaDichVu,
                    SoLuong = s.SoLuong,
                    TongTien = s.TongTien,
                    NgaySuDung = s.NgaySuDung,
                    TrangThai = s.TrangThai,
                    TenDichVu = s.MaDichVuNavigation.TenDichVu,
                    DonGia = s.MaDichVuNavigation.DonGia
                })
                .ToListAsync();
        }

        public async Task<string> CreateAsync(CreateSuDungDichVuDTO createDto)
        {
            // Kiểm tra đặt phòng tồn tại
            var datPhong = await _context.DatPhongs.FirstOrDefaultAsync(dp => dp.MaDatPhong == createDto.MaDatPhong);
            if (datPhong == null)
            {
                throw new Exception("Đặt phòng không tồn tại");
            }

            // Kiểm tra dịch vụ tồn tại
            var dichVu = await _context.DichVus.FirstOrDefaultAsync(dv => dv.MaDichVu == createDto.MaDichVu);
            if (dichVu == null)
            {
                throw new Exception("Dịch vụ không tồn tại");
            }

            // Tạo mã mới
            var lastSuDung = await _context.SuDungDichVus
                .OrderByDescending(s => s.MaSuDung)
                .FirstOrDefaultAsync();

            string newMaSuDung;

            if (lastSuDung == null || string.IsNullOrEmpty(lastSuDung.MaSuDung))
            {
                newMaSuDung = "SD001";
            }
            else
            {
                var soHienTai = int.Parse(lastSuDung.MaSuDung.Substring(2));
                newMaSuDung = "SD" + (soHienTai + 1).ToString("D3");
            }

            // Tính tổng tiền
            decimal tongTien = dichVu.DonGia * createDto.SoLuong;

            var suDungDichVu = new SuDungDichVu
            {
                MaSuDung = newMaSuDung,
                MaDatPhong = createDto.MaDatPhong,
                MaDichVu = createDto.MaDichVu,
                SoLuong = createDto.SoLuong,
                TongTien = tongTien,
                NgaySuDung = createDto.NgaySuDung ?? DateTime.Now,
                TrangThai = createDto.TrangThai
            };

            _context.SuDungDichVus.Add(suDungDichVu);
            await _context.SaveChangesAsync();

            return newMaSuDung;
        }

        public async Task<bool> UpdateAsync(string maSuDung, UpdateSuDungDichVuDTO updateDto)
        {
            var suDungDichVu = await _context.SuDungDichVus.FirstOrDefaultAsync(s => s.MaSuDung == maSuDung);
            if (suDungDichVu == null)
            {
                return false;
            }

            // Kiểm tra đặt phòng tồn tại nếu có cập nhật
            if (!string.IsNullOrEmpty(updateDto.MaDatPhong))
            {
                var datPhong = await _context.DatPhongs.FirstOrDefaultAsync(dp => dp.MaDatPhong == updateDto.MaDatPhong);
                if (datPhong == null)
                {
                    throw new Exception("Đặt phòng không tồn tại");
                }
                suDungDichVu.MaDatPhong = updateDto.MaDatPhong;
            }

            // Kiểm tra dịch vụ tồn tại nếu có cập nhật
            if (!string.IsNullOrEmpty(updateDto.MaDichVu))
            {
                var dichVu = await _context.DichVus.FirstOrDefaultAsync(dv => dv.MaDichVu == updateDto.MaDichVu);
                if (dichVu == null)
                {
                    throw new Exception("Dịch vụ không tồn tại");
                }
                suDungDichVu.MaDichVu = updateDto.MaDichVu;

                // Cập nhật tổng tiền nếu có thay đổi dịch vụ hoặc số lượng
                if (updateDto.SoLuong.HasValue)
                {
                    suDungDichVu.SoLuong = updateDto.SoLuong;
                    suDungDichVu.TongTien = dichVu.DonGia * updateDto.SoLuong.Value;
                }
                else if (suDungDichVu.SoLuong.HasValue)
                {
                    suDungDichVu.TongTien = dichVu.DonGia * suDungDichVu.SoLuong.Value;
                }
            }
            else if (updateDto.SoLuong.HasValue && !string.IsNullOrEmpty(suDungDichVu.MaDichVu))
            {
                // Cập nhật tổng tiền nếu chỉ thay đổi số lượng
                var dichVu = await _context.DichVus.FirstOrDefaultAsync(dv => dv.MaDichVu == suDungDichVu.MaDichVu);
                if (dichVu != null)
                {
                    suDungDichVu.SoLuong = updateDto.SoLuong;
                    suDungDichVu.TongTien = dichVu.DonGia * updateDto.SoLuong.Value;
                }
            }

            if (updateDto.NgaySuDung.HasValue)
            {
                suDungDichVu.NgaySuDung = updateDto.NgaySuDung;
            }

            if (!string.IsNullOrEmpty(updateDto.TrangThai))
            {
                suDungDichVu.TrangThai = updateDto.TrangThai;
            }

            _context.SuDungDichVus.Update(suDungDichVu);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(string maSuDung)
        {
            var suDungDichVu = await _context.SuDungDichVus.FirstOrDefaultAsync(s => s.MaSuDung == maSuDung);
            if (suDungDichVu == null)
            {
                return false;
            }

            _context.SuDungDichVus.Remove(suDungDichVu);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}