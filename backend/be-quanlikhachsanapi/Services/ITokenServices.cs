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
                new Claim(ClaimTypes.Name, khachHang.HoKh + " " + khachHang.TenKh)
            };

            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
