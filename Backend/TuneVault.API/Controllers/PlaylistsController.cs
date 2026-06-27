using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Playlists;
using TuneVault.Infrastructure;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlaylistsController : BaseApiController
{
    private readonly IMediator _mediator;
    private readonly TuneVaultDbContext _context;

    public PlaylistsController(IMediator mediator, TuneVaultDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    /// <summary>Playlist của tôi.</summary>
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var userId = RequireUserId();
        var playlists = await _mediator.Send(new GetPlaylistsQuery(userId));
        return Ok(playlists);
    }

    /// <summary>Playlist của người dùng khác.</summary>
    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        var playlists = await _mediator.Send(new GetPlaylistsQuery(userId));
        return Ok(playlists);
    }

    /// <summary>Chi tiết playlist.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var playlist = await _mediator.Send(new GetPlaylistDetailQuery(id));
        return Ok(playlist);
    }

    /// <summary>Tạo playlist mới.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlaylistRequest request)
    {
        var userId = RequireUserId();
        var id = await _mediator.Send(new CreatePlaylistCommand(request.Title, request.Description, userId));
        return Ok(new { id, message = "Tạo playlist thành công." });
    }

    /// <summary>Thêm bài hát vào playlist.</summary>
    [HttpPost("{playlistId:guid}/tracks/{mediaItemId:guid}")]
    public async Task<IActionResult> AddTrack(Guid playlistId, Guid mediaItemId)
    {
        await _mediator.Send(new AddTrackToPlaylistCommand(playlistId, mediaItemId));
        return Ok(new { message = "Đã thêm bài hát vào playlist." });
    }

    /// <summary>Xóa bài hát khỏi playlist.</summary>
    [HttpDelete("{playlistId:guid}/tracks/{mediaItemId:guid}")]
    public async Task<IActionResult> RemoveTrack(Guid playlistId, Guid mediaItemId)
    {
        await _mediator.Send(new RemoveTrackFromPlaylistCommand(playlistId, mediaItemId));
        return Ok(new { message = "Đã xóa bài hát khỏi playlist." });
    }
}

public record CreatePlaylistRequest(string Title, string? Description);
