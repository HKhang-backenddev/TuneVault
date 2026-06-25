using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Common;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IAnthropicService _aiService;

    public AiController(IAnthropicService aiService)
    {
        _aiService = aiService;
    }

    [Authorize]
    [HttpGet("recommend")]
    public async Task<IActionResult> GetRecommendations([FromQuery] string genre)
    {
        var prompt = $"Hãy gợi ý cho tôi 5 bài hát thuộc thể loại {genre} và giải thích ngắn gọn tại sao bằng tiếng Việt.";
        var result = await _aiService.GetAiSuggestionAsync(prompt);
        
        return Ok(new { suggestion = result });
    }
}