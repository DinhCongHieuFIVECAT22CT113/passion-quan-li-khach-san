using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.EntityFrameworkCore;

namespace be_quanlikhachsanapi.Services
{
    public interface IHoaDonRepository
    {
        Task<IEnumerable<HoaDonDTO>> GetAllAsync();
        Task<HoaDonDTO> GetByIdAsync(string maHoaDon);
        Task<HoaDonDTO> GetByDatPhongAsync(string maDatPhong);
        Task<string> CreateAsync(CreateHoaDonDTO createDto);
        Task<bool> UpdateAsync(string maHoaDon, UpdateHoaDonDTO updateDto);
        Task<bool> DeleteAsync(string maHoaDon);
        Task<bool> UpdateTrangThaiAsync(string maHoaDon, string trangThai);
        Task<decimal> TinhTongDoanhThuAsync(int thang, int nam);
    }

    public class HoaDonRepository : IHoaDonRepository
    {
        private readonly QuanLyKhachSanContext _context;

        public HoaDonRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HoaDonDTO>> GetAllAsync()
        {
            return await _context.HoaDons
                .Include(h => h.MaKmNavigation)
                .Select(h => new HoaDonDTO
                {
                    MaHoaDon = h.MaHoaDon,
                    MaDatPhong = h.MaDatPhong,
                    MaKM = h.MaKm,
                    TenKhuyenMai = h.MaKmNavigation != null ? h.MaKmNavigation.TenKhuyenMai : null,
                    GiamGiaLoaiKM = h.GiamGiaLoaiKm,
                    GiamGiaLoaiKH = h.GiamGiaLoaiKh,
                    TongTien = h.TongTien,
                    TrangThai = h.TrangThai,
                    NgayTao = h.NgayTao,
                    NgaySua = h.NgaySua
                })
                .ToListAsync();
        }

        public async Task<HoaDonDTO> GetByIdAsync(string maHoaDon)
        {
            var hoaDon = await _context.HoaDons
                .Include(h => h.MaKmNavigation)
                .FirstOrDefaultAsync(h => h.MaHoaDon == maHoaDon);

            if (hoaDon == null)
                return null;

            return new HoaDonDTO
            {
                MaHoaDon = hoaDon.MaHoaDon,
                MaDatPhong = hoaDon.MaDatPhong,
                MaKM = hoaDon.MaKm,
                TenKhuyenMai = hoaDon.MaKmNavigation != null ? hoaDon.MaKmNavigation.TenKhuyenMai : null,
                GiamGiaLoaiKM = hoaDon.GiamGiaLoaiKm,
                GiamGiaLoaiKH = hoaDon.GiamGiaLoaiKh,
                TongTien = hoaDon.TongTien,
                TrangThai = hoaDon.TrangThai,
                NgayTao = hoaDon.NgayTao,
                NgaySua = hoaDon.NgaySua
            };
        }

        public async Task<HoaDonDTO> GetByDatPhongAsync(string maDatPhong)
        {
            var hoaDon = await _context.HoaDons
                .Include(h => h.MaKmNavigation)
                .FirstOrDefaultAsync(h => h.MaDatPhong == maDatPhong);

            if (hoaDon == null)
                return null;

            return new HoaDonDTO
            {
                MaHoaDon = hoaDon.MaHoaDon,
                MaDatPhong = hoaDon.MaDatPhong,
                MaKM = hoaDon.MaKm,
                TenKhuyenMai = hoaDon.MaKmNavigation != null ? hoaDon.MaKmNavigation.TenKhuyenMai : null,
                GiamGiaLoaiKM = hoaDon.GiamGiaLoaiKm,
                GiamGiaLoaiKH = hoaDon.GiamGiaLoaiKh,
                TongTien = hoaDon.TongTien,
                TrangThai = hoaDon.TrangThai,
                NgayTao = hoaDon.NgayTao,
                NgaySua = hoaDon.NgaySua
            };
        }

        public async Task<string> CreateAsync(CreateHoaDonDTO createDto)
        {
            // Kiểm tra đặt phòng tồn tại
            var datPhong = await _context.DatPhongs.FindAsync(createDto.MaDatPhong);
            if (datPhong == null)
                throw new Exception("Đặt phòng không tồn tại");

            // Kiểm tra khuyến mãi tồn tại (nếu có)
            if (!string.IsNullOrEmpty(createDto.MaKM))
            {
                var khuyenMai = await _context.KhuyenMais.FindAsync(createDto.MaKM);
                if (khuyenMai == null)
                    throw new Exception("Khuyến mãi không tồn tại");
            }

            // Tạo mã mới
            string maHoaDon = await GenerateNewMaHoaDonAsync();

            var hoaDon = new HoaDon
            {
                MaHoaDon = maHoaDon,
                MaDatPhong = createDto.MaDatPhong,
                MaKm = createDto.MaKM,
                GiamGiaLoaiKm = createDto.GiamGiaLoaiKM,
                GiamGiaLoaiKh = createDto.GiamGiaLoaiKH,
                TongTien = createDto.TongTien,
                TrangThai = "Chưa thanh toán",
                NgayTao = DateTime.Now
            };

            await _context.HoaDons.AddAsync(hoaDon);
            await _context.SaveChangesAsync();

            return maHoaDon;
        }

        public async Task<bool> UpdateAsync(string maHoaDon, UpdateHoaDonDTO updateDto)
        {
            var hoaDon = await _context.HoaDons.FindAsync(maHoaDon);
            if (hoaDon == null)
                return false;

            if (!string.IsNullOrEmpty(updateDto.MaKM))
            {
                var khuyenMai = await _context.KhuyenMais.FindAsync(updateDto.MaKM);
                if (khuyenMai == null)
                    throw new Exception("Khuyến mãi không tồn tại");
                
                hoaDon.MaKm = updateDto.MaKM;
            }

            if (updateDto.GiamGiaLoaiKM.HasValue)
                hoaDon.GiamGiaLoaiKm = updateDto.GiamGiaLoaiKM.Value;

            if (updateDto.GiamGiaLoaiKH.HasValue)
                hoaDon.GiamGiaLoaiKh = updateDto.GiamGiaLoaiKH.Value;

            if (updateDto.TongTien.HasValue)
                hoaDon.TongTien = updateDto.TongTien.Value;

            hoaDon.NgaySua = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string maHoaDon)
        {
            var hoaDon = await _context.HoaDons.FindAsync(maHoaDon);
            if (hoaDon == null)
                return false;

            _context.HoaDons.Remove(hoaDon);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateTrangThaiAsync(string maHoaDon, string trangThai)
        {
            var hoaDon = await _context.HoaDons.FindAsync(maHoaDon);
            if (hoaDon == null)
                return false;

            hoaDon.TrangThai = trangThai;
            hoaDon.NgaySua = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<decimal> TinhTongDoanhThuAsync(int thang, int nam)
        {
            return await _context.HoaDons
                .Where(h => h.NgayTao.HasValue && 
                       h.NgayTao.Value.Month == thang && 
                       h.NgayTao.Value.Year == nam &&
                       h.TrangThai == "Đã thanh toán")
                .SumAsync(h => h.TongTien);
        }

        private async Task<string> GenerateNewMaHoaDonAsync()
        {
            var lastHoaDon = await _context.HoaDons
                .OrderByDescending(h => h.MaHoaDon)
                .FirstOrDefaultAsync();

            string newId;
            if (lastHoaDon == null)
            {
                newId = "HD001";
            }
            else
            {
                // Trích xuất số từ mã cuối cùng
                string lastId = lastHoaDon.MaHoaDon;
                if (lastId.StartsWith("HD") && lastId.Length > 2)
                {
                    string numberPart = lastId.Substring(2);
                    if (int.TryParse(numberPart, out int lastNumber))
                    {
                        int newNumber = lastNumber + 1;
                        newId = $"HD{newNumber:D3}";
                    }
                    else
                    {
                        newId = "HD001";
                    }
                }
                else
                {
                    newId = "HD001";
                }
            }

            return newId;
        }
    }
}
