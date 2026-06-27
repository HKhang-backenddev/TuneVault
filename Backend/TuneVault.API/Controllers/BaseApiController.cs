using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace TuneVault.API.Controllers;

public abstract class BaseApiController : ControllerBase
{
    protected Guid? GetCurrentUserId()
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(idValue, out var id) ? id : null;
    }

    protected Guid RequireUserId()
    {
        return GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("Bạn cần đăng nhập để thực hiện thao tác này.");
    }
}
