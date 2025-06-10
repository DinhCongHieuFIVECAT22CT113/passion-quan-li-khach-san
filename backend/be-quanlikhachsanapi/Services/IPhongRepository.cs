using be_quanlikhachsanapi.Data;
using be_quanlikhachsanapi.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace be_quanlikhachsanapi.Services
{
    public interface IPhongRepository
    {
        List<PhongDTO> GetAll();
        JsonResult GetPhongById(string MaPhong);
        Task<List<PhongDTO>> GetPhongByMaLoaiPhongAsync(string maLoaiPhong);
        Task<JsonResult> CreatePhong(CreatePhongDTO createPhong);
        Task<JsonResult> UpdatePhong(string MaPhong, UpdatePhongDTO updatePhong);
        JsonResult DeletePhong(string MaPhong);
        JsonResult UpdateTrangThai(string MaPhong, string TrangThai);
    }
}