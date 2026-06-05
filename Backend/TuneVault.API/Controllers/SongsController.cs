using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Media;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SongsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetSongs([FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var response = await _mediator.Send(new GetSongsQuery(query, page, pageSize));
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSongById(Guid id)
    {
        try
        {
            var song = await _mediator.Send(new GetSongByIdQuery(id));
            return Ok(song);
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
}
