using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.Application.Playlists;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlaylistsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlaylistsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            throw new UnauthorizedAccessException("Invalid user");
        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlaylists()
    {
        try
        {
            var userId = GetUserId();
            var playlists = await _mediator.Send(new GetPlaylistsQuery(userId));
            return Ok(playlists);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreatePlaylist([FromBody] CreatePlaylistDto dto)
    {
        try
        {
            var userId = GetUserId();
            var playlistId = await _mediator.Send(new CreatePlaylistCommand(dto.Title, dto.Description, userId));
            return Ok(new { PlaylistId = playlistId });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPlaylistDetail(Guid id)
    {
        try
        {
            var playlist = await _mediator.Send(new GetPlaylistDetailQuery(id));
            return Ok(playlist);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("{playlistId}/tracks/{mediaItemId}")]
    public async Task<IActionResult> AddTrack(Guid playlistId, Guid mediaItemId)
    {
        try
        {
            await _mediator.Send(new AddTrackToPlaylistCommand(playlistId, mediaItemId));
            return Ok(new { Message = "Track added to playlist" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpDelete("{playlistId}/tracks/{mediaItemId}")]
    public async Task<IActionResult> RemoveTrack(Guid playlistId, Guid mediaItemId)
    {
        try
        {
            await _mediator.Send(new RemoveTrackFromPlaylistCommand(playlistId, mediaItemId));
            return Ok(new { Message = "Track removed from playlist" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}

public record CreatePlaylistDto(string Title, string? Description);
