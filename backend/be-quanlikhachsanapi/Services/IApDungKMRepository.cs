using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.EntityFrameworkCore;


namespace be_quanlikhachsanapi.Services
{
    public interface IApDungKMRepository
    {
        Task<IEnumerable<ApDungKMDTO>> GetAllAsync();
        Task<ApDungKMDTO> GetByIdAsync(string maApDung);
        Task<IEnumerable<ApDungKMDTO>> GetByDatPhongAsync(string maDatPhong);
        Task<string> CreateAsync(CreateApDungKMDTO createDto);
        Task<bool> UpdateAsync(string maApDung, UpdateApDungKMDTO updateDto);
        Task<bool> DeleteAsync(string maApDung);
    }
    public class ApDungKMRepository : IApDungKMRepository
    {
        private readonly QuanLyKhachSanContext _context;

        public ApDungKMRepository(QuanLyKhachSanContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ApDungKMDTO>> GetAllAsync()
        {
            return await _context.ApDungKms
                .Include(a => a.MaKmNavigation)
                .Select(a => new ApDungKMDTO
                {
                    MaApDung = a.MaApDung,
                    MaKM = a.MaKm,
                    TenKhuyenMai = a.MaKmNavigation.TenKhuyenMai,
                    MaDatPhong = a.MaDatPhong,
                    SoTienGiam = a.SoTienGiam
                })
                .ToListAsync();
        }

        public async Task<ApDungKMDTO> GetByIdAsync(string maApDung)
        {
            var apDungKM = await _context.ApDungKms
                .Include(a => a.MaKmNavigation)
                .FirstOrDefaultAsync(a => a.MaApDung == maApDung);

            if (apDungKM == null)
                return null;

            return new ApDungKMDTO
            {
                MaApDung = apDungKM.MaApDung,
                MaKM = apDungKM.MaKm,
                TenKhuyenMai = apDungKM.MaKmNavigation.TenKhuyenMai,
                MaDatPhong = apDungKM.MaDatPhong,
                SoTienGiam = apDungKM.SoTienGiam
            };
        }

        public async Task<IEnumerable<ApDungKMDTO>> GetByDatPhongAsync(string maDatPhong)
        {
            return await _context.ApDungKms
                .Include(a => a.MaKmNavigation)
                .Where(a => a.MaDatPhong == maDatPhong)
                .Select(a => new ApDungKMDTO
                {
                    MaApDung = a.MaApDung,
                    MaKM = a.MaKm,
                    TenKhuyenMai = a.MaKmNavigation.TenKhuyenMai,
                    MaDatPhong = a.MaDatPhong,
                    SoTienGiam = a.SoTienGiam
                })
                .ToListAsync();
        }

        public async Task<string> CreateAsync(CreateApDungKMDTO createDto)
        {
            // Kiểm tra khuyến mãi tồn tại
            var khuyenMai = await _context.KhuyenMais.FindAsync(createDto.MaKM);
            if (khuyenMai == null)
                throw new Exception("Khuyến mãi không tồn tại");

            // Kiểm tra đặt phòng tồn tại
            var datPhong = await _context.DatPhongs.FindAsync(createDto.MaDatPhong);
            if (datPhong == null)
                throw new Exception("Đặt phòng không tồn tại");

            // Tạo mã mới
            string maApDung = await GenerateNewMaApDungAsync();

            var apDungKM = new ApDungKm
            {
                MaApDung = maApDung,
                MaKm = createDto.MaKM,
                MaDatPhong = createDto.MaDatPhong,
                SoTienGiam = createDto.SoTienGiam
            };

            await _context.ApDungKms.AddAsync(apDungKM);
            await _context.SaveChangesAsync();

            return maApDung;
        }

        public async Task<bool> UpdateAsync(string maApDung, UpdateApDungKMDTO updateDto)
        {
            var apDungKM = await _context.ApDungKms.FindAsync(maApDung);
            if (apDungKM == null)
                return false;

            if (!string.IsNullOrEmpty(updateDto.MaKM))
            {
                var khuyenMai = await _context.KhuyenMais.FindAsync(updateDto.MaKM);
                if (khuyenMai == null)
                    throw new Exception("Khuyến mãi không tồn tại");
                
                apDungKM.MaKm = updateDto.MaKM;
            }

            if (!string.IsNullOrEmpty(updateDto.MaDatPhong))
            {
                var datPhong = await _context.DatPhongs.FindAsync(updateDto.MaDatPhong);
                if (datPhong == null)
                    throw new Exception("Đặt phòng không tồn tại");
                
                apDungKM.MaDatPhong = updateDto.MaDatPhong;
            }

            if (updateDto.SoTienGiam.HasValue)
            {
                apDungKM.SoTienGiam = updateDto.SoTienGiam.Value;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string maApDung)
        {
            var apDungKM = await _context.ApDungKms.FindAsync(maApDung);
            if (apDungKM == null)
                return false;

            _context.ApDungKms.Remove(apDungKM);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<string> GenerateNewMaApDungAsync()
        {
            var lastApDung = await _context.ApDungKms
                .OrderByDescending(a => a.MaApDung)
                .FirstOrDefaultAsync();

            string newId;
            if (lastApDung == null)
            {
                newId = "AP0000001";
            }
            else
            {
                // Tách phần số từ mã cuối cùng (ví dụ: AP0000005 -> 5)
                if (int.TryParse(lastApDung.MaApDung.Substring(2), out int lastNumber))
                {
                    newId = $"AP{(lastNumber + 1).ToString().PadLeft(7, '0')}";
                }
                else
                {
                    // Fallback nếu không thể parse
                    int count = await _context.ApDungKms.CountAsync();
                    newId = $"AP{(count + 1).ToString().PadLeft(7, '0')}";
                }
            }
            
            // Kiểm tra xem mã đã tồn tại chưa
            while (await _context.ApDungKms.AnyAsync(a => a.MaApDung == newId))
            {
                // Tăng số và tạo mã mới
                int currentNumber = int.Parse(newId.Substring(2));
                newId = $"AP{(currentNumber + 1).ToString().PadLeft(7, '0')}";
            }
            
            return newId;
        }
    }
}