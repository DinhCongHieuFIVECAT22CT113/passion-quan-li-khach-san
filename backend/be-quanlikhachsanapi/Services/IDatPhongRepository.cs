using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http; // Thêm namespace này

namespace be_quanlikhachsanapi.Services
{
    public interface IDatPhongRepository
    {
        List<DatPhongDTO> GetAll();
        JsonResult GetDatPhongById(string MaDatPhong);
        JsonResult CreateDatPhong(CreateDatPhongDTO createDatPhong);
        JsonResult UpdateDatPhong(string MaDatPhong, UpdateDatPhongDTO updateDatPhong);
        JsonResult UpdateTrangThai(string MaDatPhong, string TrangThai);
        JsonResult DeleteDatPhong(string MaDatPhong);
        Task<IEnumerable<DatPhong>> GetDatPhongByKhachHang(string maKhachHang);
    }
}