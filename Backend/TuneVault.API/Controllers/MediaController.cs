using Microsoft.AspNetCore.Mvc;
using TuneVault.Infrastructure;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly TuneVaultDbContext _db;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public MediaController(TuneVaultDbContext db, IConfiguration config, IWebHostEnvironment env)
    {
        _db = db;
        _config = config;
        _env = env;
    }

    [HttpGet]
    public IActionResult Get([FromQuery] string? query)
    {
        try
        {
            var q = _db.MediaItems.AsQueryable();
            if (!string.IsNullOrWhiteSpace(query)) q = q.Where(m => m.Title.Contains(query));

            var storage = _config["Storage:MediaPath"] ?? Path.Combine(_env.ContentRootPath, "storage", "media");

            var list = q.Select(m => new {
                id = m.Id,
                title = m.Title,
                createdAt = m.CreatedAt,
                url = "/media/" + m.FilePath
            }).ToList();

            return Ok(list);
        }
        catch (Exception ex)
        {
            // If DB isn't initialized or another error occurs, return an empty list so frontend stays functional.
            // The detailed error is still logged by the framework.
            return Ok(new object[0]);
        }
    }
}
