using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TuneVault.Domain;

namespace TuneVault.Application.Users;

public class JwtTokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly SymmetricSecurityKey _key;

    public JwtTokenService(IConfiguration configuration, SymmetricSecurityKey key)
    {
        _configuration = configuration;
        _key = key;
    }

    public string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim("displayName", user.DisplayName ?? user.Username),
            new Claim("bio", user.Bio ?? ""), // Thêm bio vào claim
            new Claim("avatarUrl", user.AvatarUrl ?? "") // Thêm avatarUrl vào claim
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        // Đây là cách tiếp cận đáng tin cậy nhất để đảm bảo 'kid' được thêm vào header.
        // Chúng ta tạo một SigningCredentials mới và truyền trực tiếp SymmetricSecurityKey (vốn đã có KeyId).
        // JwtSecurityTokenHandler sẽ tự động đọc KeyId từ key và thêm vào header của token.
        var signingCredentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            Subject = new ClaimsIdentity(claims),
            NotBefore = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddDays(7), // Sử dụng UtcNow để nhất quán
            SigningCredentials = signingCredentials
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}