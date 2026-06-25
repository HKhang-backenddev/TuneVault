using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.Application.Media;
using TuneVault.Application.Common;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TuneVault.Application.Users;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaItemsController : ControllerBase
{
    private readonly IMediator _mediator;

    public MediaItemsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetSongs([FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _mediator.Send(new GetSongsQuery(query, page, pageSize));
        return Ok(ApiResponse<GetSongsResponse>.SuccessResult(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetSongByIdQuery(id));
        return Ok(ApiResponse<SongDetailDto>.SuccessResult(result));
    }

    [Authorize]
    [HttpPost("share")]
    public async Task<IActionResult> Share([FromBody] ShareMediaRequest req)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId)) 
            return Unauthorized();

        try
        {
            var result = await _mediator.Send(new ShareMediaCommand(userId, req.ReceiverUsername, req.MediaId, req.PlaylistId));
            return Ok(new { success = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class ShareMediaRequest
{
    public string ReceiverUsername { get; set; } = string.Empty;
    public Guid? MediaId { get; set; }
    public Guid? PlaylistId { get; set; }
}