using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Media;
using TuneVault.Application.Users;
using TuneVault.Infrastructure;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaItemsController : BaseApiController
{
    private readonly IMediator _mediator;
    private readonly TuneVaultDbContext _context;

    public MediaItemsController(IMediator mediator, TuneVaultDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    /// <summary>Lấy chi tiết bài hát theo ID.</summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var song = await _mediator.Send(new GetSongByIdQuery(id));
        var userId = GetCurrentUserId();
        var isLiked = userId.HasValue &&
            await _context.Favorites.AnyAsync(f => f.UserId == userId.Value && f.MediaItemId == id);

        return Ok(new
        {
            id = song.Id,
            title = song.Title,
            description = song.Description,
            artist = song.ArtistName ?? "Nghệ sĩ không xác định",
            artistId = song.ArtistId,
            url = $"/api/media/stream/{song.Id}",
            thumbnailUrl = song.ThumbnailUrl ?? "",
            durationInSeconds = song.DurationInSeconds,
            genre = song.Genre,
            createdAt = song.CreatedAt,
            isLiked
        });
    }

    /// <summary>Chia sẻ bài hát hoặc playlist cho người khác.</summary>
    [HttpPost("share")]
    [Authorize]
    public async Task<IActionResult> Share([FromBody] ShareMediaRequest request)
    {
        var senderId = RequireUserId();
        var success = await _mediator.Send(new ShareMediaCommand(
            senderId,
            request.ReceiverUsername,
            request.MediaId,
            request.PlaylistId));

        return Ok(new { success, message = "Chia sẻ thành công." });
    }
}

public record ShareMediaRequest(string ReceiverUsername, Guid? MediaId = null, Guid? PlaylistId = null);
