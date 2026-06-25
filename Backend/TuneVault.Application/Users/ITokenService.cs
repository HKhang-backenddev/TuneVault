using TuneVault.Domain;

namespace TuneVault.Application.Users;

public interface ITokenService
{
    string GenerateJwtToken(User user);
}