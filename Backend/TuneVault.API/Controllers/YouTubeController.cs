using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.YouTube;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class YouTubeController : ControllerBase
{
    private readonly IMediator _mediator;

    public YouTubeController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchYouTube([FromQuery] string query, [FromQuery] int limit = 10)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { Error = "Query is required" });

            var results = await _mediator.Send(new SearchYouTubeQuery(query, limit));
            return Ok(results);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("stream/{videoId}")]
    public async Task<IActionResult> GetStreamUrl(string videoId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(videoId))
                return BadRequest(new { Error = "Video ID is required" });

            var streamUrl = await _mediator.Send(new GetYouTubeStreamUrlQuery(videoId));
            return Ok(new { url = streamUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}
