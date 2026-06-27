using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Media;
using TuneVault.Infrastructure;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : BaseApiController
{
    private readonly IMediator _mediator;
    private readonly TuneVaultDbContext _context;

    public FavoritesController(IMediator mediator, TuneVaultDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    /// <summary>Danh sách bài hát yêu thích.</summary>
    [HttpGet]
    public async Task<IActionResult> GetFavorites([FromQuery] string sortBy = "recent")
    {
        var userId = RequireUserId();

        var query = _context.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.MediaItem)!
            .ThenInclude(m => m!.Artist)
            .AsQueryable();

        query = sortBy switch
        {
            "title" => query.OrderBy(f => f.MediaItem!.Title),
            "artist" => query.OrderBy(f => f.MediaItem!.Artist!.Name),
            _ => query.OrderByDescending(f => f.LikedAt)
        };

        var items = await query.Select(f => new
        {
            id = f.MediaItemId,
            title = f.MediaItem!.Title,
            artist = f.MediaItem.Artist != null ? f.MediaItem.Artist.Name : "Nghệ sĩ không xác định",
            url = $"/api/media/stream/{f.MediaItemId}",
            thumbnailUrl = f.MediaItem.ThumbnailUrl ?? "",
            durationInSeconds = f.MediaItem.DurationInSeconds,
            isLiked = true
        }).ToListAsync();

        return Ok(items);
    }

    /// <summary>Thêm / bỏ yêu thích bài hát.</summary>
    [HttpPost("toggle/{mediaItemId:guid}")]
    public async Task<IActionResult> Toggle(Guid mediaItemId)
    {
        var userId = RequireUserId();
        var isLiked = await _mediator.Send(new ToggleFavoriteCommand(userId, mediaItemId));
        return Ok(new { isLiked });
    }
}
