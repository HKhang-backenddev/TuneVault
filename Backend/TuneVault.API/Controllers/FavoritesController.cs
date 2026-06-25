using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TuneVault.Infrastructure;
using TuneVault.Application.Media;
using TuneVault.Domain;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Cho phép guest mode truy cập
public class FavoritesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly TuneVaultDbContext _context;

    public FavoritesController(IMediator mediator, TuneVaultDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLikedSongs([FromQuery] string sortBy = "recent")
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        Guid userId;

        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out userId))
        {
            // Truy vấn chỉ lấy Id để tránh lỗi khi schema User có khác biệt (ví dụ một vài cột chưa migrate)
            var firstUserId = await _context.Users.Select(u => u.Id).FirstOrDefaultAsync();
            if (firstUserId == Guid.Empty) return Ok(new List<object>());
            userId = firstUserId;
        }

        var query = _context.Favorites
            .Where(f => f.UserId == userId && f.MediaItem != null)
            .Include(f => f.MediaItem!)
            .ThenInclude(m => m.Artist);

        IOrderedQueryable<Favorite> orderedQuery = sortBy.ToLower() switch
        {
            "oldest" => query.OrderBy(f => f.LikedAt),
            "title_asc" => query.OrderBy(f => f.MediaItem!.Title),
            "title_desc" => query.OrderByDescending(f => f.MediaItem!.Title),
            _ => query.OrderByDescending(f => f.LikedAt) // Mặc định: Gần đây nhất
        };

        var likedSongs = await orderedQuery
            .Select(f => new {
                id = f.MediaItem!.Id,
                title = f.MediaItem!.Title,
                artist = f.MediaItem!.Artist != null ? f.MediaItem!.Artist!.Name : "Nghệ sĩ không xác định",
                url = "/api/media/stream/" + f.MediaItem!.Id,
                thumbnailUrl = !string.IsNullOrEmpty(f.MediaItem!.ThumbnailUrl) 
                    ? f.MediaItem!.ThumbnailUrl 
                    : "/assets/default-cover.png",
                durationInSeconds = f.MediaItem!.DurationInSeconds,
                isLiked = true
            })
            .ToListAsync();

        return Ok(likedSongs);
    }

    [HttpPost("toggle/{mediaItemId}")]
    public async Task<IActionResult> ToggleFavorite(Guid mediaItemId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        Guid userId;

        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out userId))
        {
            // Chỉ lấy Id để tránh truy vấn các cột không tồn tại trong DB
            var firstUserId = await _context.Users.Select(u => u.Id).FirstOrDefaultAsync();
            if (firstUserId == Guid.Empty) return Unauthorized();
            userId = firstUserId;
        }

        var isLiked = await _mediator.Send(new ToggleFavoriteCommand(userId, mediaItemId));
        return Ok(new { isLiked });
    }
}