using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace be_quanlikhachsanapi.Services
{
    public interface IBaoCaoRepository
    {
        List<BaoCaoDoanhThuDTO> GetAll();
        JsonResult GetBaoCaoById(string MaBaoCao);
        Task<JsonResult> CreateBaoCao(CreateBaoCaoDoanhThuDTO createBaoCao);
        Task<JsonResult> UpdateBaoCao(string MaBaoCao, UpdateBaoCaoDoanhThuDTO updateBaoCao);
        JsonResult DeleteBaoCao(string MaBaoCao);
    }

    public class BaoCaoRepository : IBaoCaoRepository
    {
        private readonly QuanLyKhachSanContext _context;
        private readonly IWriteFileRepository _fileRepository;
        private readonly ILogger<DichVuRepository> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BaoCaoRepository(QuanLyKhachSanContext context, IWriteFileRepository fileRepository, ILogger<DichVuRepository> logger, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _fileRepository = fileRepository;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public List<BaoCaoDoanhThuDTO> GetAll()
        {
            var baoCaoDoanhThus = _context.BaoCaoDoanhThus.ToList();
            return baoCaoDoanhThus.Select(bcdt => new BaoCaoDoanhThuDTO
            {
                MaBaoCao = bcdt.MaBaoCao,
                Thang = bcdt.Thang,
                Nam = bcdt.Nam,
                TongDoanhThu = bcdt.TongDoanhThu,
                TongDatPhong = bcdt.TongDatPhong,
                TongDichVuDaSuDung = bcdt.TongDichVuDaSuDung,
                NgayTao = bcdt.NgayTao
            }).ToList();
        }

        public JsonResult GetBaoCaoById(string MaBaoCao)
        {
            var baoCao = _context.BaoCaoDoanhThus.FirstOrDefault(bcdt => bcdt.MaBaoCao == MaBaoCao);
            if (baoCao == null)
            {
                return new JsonResult(null) { StatusCode = 404 };
            }
            var _baoCao = new BaoCaoDoanhThuDTO
            {
                MaBaoCao = baoCao.MaBaoCao,
                Thang = baoCao.Thang,
                Nam = baoCao.Nam,
                TongDoanhThu = baoCao.TongDoanhThu,
                TongDatPhong = baoCao.TongDatPhong,
                TongDichVuDaSuDung = baoCao.TongDichVuDaSuDung,
                NgayTao = baoCao.NgayTao,
                MaNv = baoCao.MaNv
            };
            return new JsonResult(_baoCao) { StatusCode = 200 };
        }

        public Task<JsonResult> CreateBaoCao(CreateBaoCaoDoanhThuDTO createBaoCao)
        {
            if (createBaoCao == null)
            {
                return Task.FromResult(new JsonResult("Invalid data") { StatusCode = 400 });
            }

            var lastBaoCao = _context.BaoCaoDoanhThus
                .OrderByDescending(bcdt => bcdt.MaBaoCao)
                .FirstOrDefault();

            string newMaBaoCao;

            if (lastBaoCao == null || string.IsNullOrEmpty(lastBaoCao.MaBaoCao))
            {
                newMaBaoCao = "BCDT01";
            }
            else
            {
                int lastNumber = int.Parse(lastBaoCao.MaBaoCao.Substring(4));
                newMaBaoCao = "BCDT" + (lastNumber + 1).ToString("D2");
            }

            var baoCao = new BaoCaoDoanhThu
            {
                MaBaoCao = newMaBaoCao,
                Thang = createBaoCao.Thang,
                Nam = createBaoCao.Nam,
                TongDoanhThu = createBaoCao.TongDoanhThu,
                TongDatPhong = createBaoCao.TongDatPhong,
                TongDichVuDaSuDung = createBaoCao.TongDichVuDaSuDung,
                MaNv = createBaoCao.MaNv,
                NgayTao = DateTime.Now
            };

            _context.BaoCaoDoanhThus.Add(baoCao);
            _context.SaveChanges();

            return Task.FromResult(new JsonResult(baoCao) { StatusCode = 201 });
        }

        public Task<JsonResult> UpdateBaoCao(string MaBaoCao, UpdateBaoCaoDoanhThuDTO updateBaoCao)
        {
            var baoCao = _context.BaoCaoDoanhThus.FirstOrDefault(bcdt => bcdt.MaBaoCao == MaBaoCao);
            if (baoCao == null)
            {
                return Task.FromResult(new JsonResult("Báo cáo không tồn tại") { StatusCode = 404 });
            }

            baoCao.TongDoanhThu = updateBaoCao.TongDoanhThu;
            baoCao.TongDatPhong = updateBaoCao.TongDatPhong;
            baoCao.TongDichVuDaSuDung = updateBaoCao.TongDichVuDaSuDung;

            _context.BaoCaoDoanhThus.Update(baoCao);
            _context.SaveChanges();

            return Task.FromResult(new JsonResult(baoCao) { StatusCode = 200 });
        }

        public JsonResult DeleteBaoCao(string MaBaoCao)
        {
            var baoCao = _context.BaoCaoDoanhThus.FirstOrDefault(bcdt => bcdt.MaBaoCao == MaBaoCao);
            if (baoCao == null)
            {
                return new JsonResult("Báo cáo không tồn tại") { StatusCode = 404 };
            }

            _context.BaoCaoDoanhThus.Remove(baoCao);
            _context.SaveChanges();

            return new JsonResult("Xóa báo cáo thành công") { StatusCode = 200 };
        }
        
    }
}