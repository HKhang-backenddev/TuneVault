using Microsoft.AspNetCore.Mvc;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : BaseApiController
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { 
            status = "ok", 
            timestamp = DateTime.UtcNow,
            service = "TuneVault API"
        });
    }
}
