using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using be_quanlikhachsanapi.Data;
using Microsoft.IdentityModel.Tokens;

namespace be_quanlikhachsanapi.Services
{
    public interface ITokenService
    {
        string CreateToken(KhachHang khachHang);
        string CreateToken(NhanVien nhanVien);
    }

    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key;

        public TokenService(IConfiguration config)
        {
            _config = config;
            var tokenKey = _config["TokenKey"];
            ArgumentNullException.ThrowIfNull(tokenKey, nameof(tokenKey));
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
        }

        public string CreateToken(KhachHang khachHang)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.NameId, khachHang.MaKh),
                new Claim(JwtRegisteredClaimNames.Email, khachHang.Email),
                new Claim("name", khachHang.HoKh + " " + khachHang.TenKh),
                new Claim("role", khachHang.MaRole ?? "CTM"),
                new Claim("mobilephone", khachHang.Sdt ?? string.Empty),
                new Claim("username", khachHang.UserName ?? string.Empty),
                new Claim("cccd", khachHang.SoCccd ?? string.Empty),
                new Claim("address", khachHang.DiaChi ?? string.Empty)
            };

            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddMinutes(10),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public string CreateToken(NhanVien nhanVien)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.NameId, nhanVien.MaNv),
                new Claim(JwtRegisteredClaimNames.Email, nhanVien.Email),
                new Claim("name", nhanVien.HoNv + " " + nhanVien.TenNv),
                new Claim("role", nhanVien.MaRole ?? "CRW"),
                new Claim("mobilephone", nhanVien.Sdt ?? string.Empty),
                new Claim("username", nhanVien.UserName ?? string.Empty),
                new Claim("chucvu", nhanVien.ChucVu ?? string.Empty)
            };

            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddMinutes(10),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
