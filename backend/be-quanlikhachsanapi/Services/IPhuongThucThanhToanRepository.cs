using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.EntityFrameworkCore;

namespace be_quanlikhachsanapi.Services
{
    public interface IPhuongThucThanhToanRepository
    {
        Task<IEnumerable<PhuongThucThanhToanDTO>> GetAllAsync();
        Task<PhuongThucThanhToanDTO> GetByIdAsync(string maPhuongThucThanhToan);
        Task<IEnumerable<PhuongThucThanhToanDTO>> GetByHoaDonAsync(string maHoaDon);
        Task<string> CreateAsync(CreatePhuongThucThanhToanDTO createDto);
        Task<bool> UpdateAsync(string maPhuongThucThanhToan, UpdatePhuongThucThanhToanDTO updateDto);
        Task<bool> DeleteAsync(string maPhuongThucThanhToan);
        Task<bool> UpdateTrangThaiAsync(string maPhuongThucThanhToan, string trangThai);
    }
    public class PhuongThucThanhToanRepository : IPhuongThucThanhToanRepository
    {
        private readonly DataQlks113Nhom2Context _context;

        public PhuongThucThanhToanRepository(DataQlks113Nhom2Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PhuongThucThanhToanDTO>> GetAllAsync()
        {
            try
            {
                // Kiểm tra xem bảng HoaDon có dữ liệu không
                var hoaDonCount = await _context.HoaDons.CountAsync();
                Console.WriteLine($"Số lượng hóa đơn trong cơ sở dữ liệu: {hoaDonCount}");

                return await _context.PhuongThucThanhToans
                    .Select(p => new PhuongThucThanhToanDTO
                    {
                        MaPhuongThucThanhToan = p.MaPhuongThucThanhToan,
                        MaHoaDon = p.MaHoaDon,
                        PhuongThucThanhToan = p.PhuongThucThanhToan1,
                        TrangThai = p.TrangThai,
                        NgayThanhToan = p.NgayThanhToan,
                        NgayTao = p.NgayTao,
                        NgaySua = p.NgaySua
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi trong GetAllAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw; // Re-throw để controller có thể xử lý
            }
        }

        public async Task<PhuongThucThanhToanDTO> GetByIdAsync(string maPhuongThucThanhToan)
        {
            var phuongThuc = await _context.PhuongThucThanhToans
                .FirstOrDefaultAsync(p => p.MaPhuongThucThanhToan == maPhuongThucThanhToan);

            if (phuongThuc == null)
                return null;

            return new PhuongThucThanhToanDTO
            {
                MaPhuongThucThanhToan = phuongThuc.MaPhuongThucThanhToan,
                MaHoaDon = phuongThuc.MaHoaDon,
                PhuongThucThanhToan = phuongThuc.PhuongThucThanhToan1,
                TrangThai = phuongThuc.TrangThai,
                NgayThanhToan = phuongThuc.NgayThanhToan,
                NgayTao = phuongThuc.NgayTao,
                NgaySua = phuongThuc.NgaySua
            };
        }

        public async Task<IEnumerable<PhuongThucThanhToanDTO>> GetByHoaDonAsync(string maHoaDon)
        {
            return await _context.PhuongThucThanhToans
                .Where(p => p.MaHoaDon == maHoaDon)
                .Select(p => new PhuongThucThanhToanDTO
                {
                    MaPhuongThucThanhToan = p.MaPhuongThucThanhToan,
                    MaHoaDon = p.MaHoaDon,
                    PhuongThucThanhToan = p.PhuongThucThanhToan1,
                    TrangThai = p.TrangThai,
                    NgayThanhToan = p.NgayThanhToan,
                    NgayTao = p.NgayTao,
                    NgaySua = p.NgaySua
                })
                .ToListAsync();
        }

        public async Task<string> CreateAsync(CreatePhuongThucThanhToanDTO createDto)
        {
            // Kiểm tra hóa đơn tồn tại
            var hoaDon = await _context.HoaDons.FindAsync(createDto.MaHoaDon);
            if (hoaDon == null)
                throw new Exception("Hóa đơn không tồn tại");

            // Tạo mã mới
            string maPhuongThuc = await GenerateNewMaPhuongThucAsync();

            var phuongThuc = new PhuongThucThanhToan
            {
                MaPhuongThucThanhToan = maPhuongThuc,
                MaHoaDon = createDto.MaHoaDon,
                PhuongThucThanhToan1 = createDto.PhuongThucThanhToan,
                TrangThai = "Chờ xử lý",
                NgayThanhToan = createDto.NgayThanhToan,
                NgayTao = DateTime.Now
            };

            await _context.PhuongThucThanhToans.AddAsync(phuongThuc);
            await _context.SaveChangesAsync();

            return maPhuongThuc;
        }

        public async Task<bool> UpdateAsync(string maPhuongThucThanhToan, UpdatePhuongThucThanhToanDTO updateDto)
        {
            var phuongThuc = await _context.PhuongThucThanhToans.FindAsync(maPhuongThucThanhToan);
            if (phuongThuc == null)
                return false;

            if (!string.IsNullOrEmpty(updateDto.PhuongThucThanhToan))
                phuongThuc.PhuongThucThanhToan1 = updateDto.PhuongThucThanhToan;

            if (updateDto.NgayThanhToan.HasValue)
                phuongThuc.NgayThanhToan = updateDto.NgayThanhToan;

            phuongThuc.NgaySua = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string maPhuongThucThanhToan)
        {
            var phuongThuc = await _context.PhuongThucThanhToans.FindAsync(maPhuongThucThanhToan);
            if (phuongThuc == null)
                return false;

            _context.PhuongThucThanhToans.Remove(phuongThuc);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateTrangThaiAsync(string maPhuongThucThanhToan, string trangThai)
        {
            var phuongThuc = await _context.PhuongThucThanhToans.FindAsync(maPhuongThucThanhToan);
            if (phuongThuc == null)
                return false;

            phuongThuc.TrangThai = trangThai;
            phuongThuc.NgaySua = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<string> GenerateNewMaPhuongThucAsync()
        {
            var lastPhuongThuc = await _context.PhuongThucThanhToans
                .OrderByDescending(p => p.MaPhuongThucThanhToan)
                .FirstOrDefaultAsync();

            string newId;
            if (lastPhuongThuc == null)
            {
                newId = "PT01";
            }
            else
            {
                // Trích xuất số từ mã cuối cùng
                string lastId = lastPhuongThuc.MaPhuongThucThanhToan;
                if (lastId.StartsWith("PT") && lastId.Length > 2)
                {
                    string numberPart = lastId.Substring(2);
                    if (int.TryParse(numberPart, out int lastNumber))
                    {
                        int newNumber = lastNumber + 1;
                        newId = $"PT{newNumber:D2}";
                    }
                    else
                    {
                        newId = "PT01";
                    }
                }
                else
                {
                    newId = "PT01";
                }
            }

            return newId;
        }
    }
}
