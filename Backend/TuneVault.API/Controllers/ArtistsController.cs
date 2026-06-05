using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Artists;
using TuneVault.Application.Media;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtistsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ArtistsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetArtists([FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var response = await _mediator.Send(new GetArtistsQuery(query, page, pageSize));
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetArtistById(Guid id)
    {
        try
        {
            var artist = await _mediator.Send(new GetArtistByIdQuery(id));
            return Ok(artist);
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

    [HttpGet("{id}/songs")]
    public async Task<IActionResult> GetArtistSongs(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var response = await _mediator.Send(new GetArtistSongsQuery(id, page, pageSize));
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}
