using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AIController : BaseApiController
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AIController> _logger;

    public AIController(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<AIController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Message is required" });
        }

        var apiKey = _configuration["AI:GroqApiKey"];
        var model = _configuration["AI:Model"] ?? "llama-3.3-70b-versatile";

        if (string.IsNullOrEmpty(apiKey))
        {
            // Fallback to simple responses if no API key
            return Ok(new { response = GetSimpleResponse(request.Message) });
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", apiKey);

            var systemPrompt = @"Bạn là trợ lý AI của TuneVault - ứng dụng nghe nhạc trực tuyến. 
Bạn thân thiện, nhiệt tình và hỗ trợ người dùng về:
- Tìm kiếm bài hát, nghệ sĩ, album
- Tạo và quản lý playlist
- Tính năng yêu thích, chia sẻ nhạc
- Hướng dẫn sử dụng app
- Gợi ý nhạc mới

Trả lời bằng tiếng Việt, ngắn gọn và hữu ích.";

            var messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = request.Message }
            };

            var requestBody = new
            {
                model = model,
                messages = messages,
                temperature = 0.7,
                max_tokens = 500
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync(
                "https://api.groq.com/openai/v1/chat/completions",
                content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("Groq API error: {Error}", error);
                return Ok(new { response = GetSimpleResponse(request.Message) });
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            var aiResponse = jsonResponse
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return Ok(new { response = aiResponse });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling AI API");
            return Ok(new { response = GetSimpleResponse(request.Message) });
        }
    }

    private string GetSimpleResponse(string message)
    {
        var msg = message.ToLower();

        if (msg.Contains("xin chào") || msg.Contains("hello") || msg.Contains("hi"))
            return "Chào bạn! 👋 Tôi là AI Assistant của TuneVault. Tôi có thể giúp gì cho bạn?";

        if (msg.Contains("tìm") || msg.Contains("search"))
            return "Để tìm bài hát, click vào Search Songs ở menu bên trái và gõ tên bài hát hoặc nghệ sĩ!";

        if (msg.Contains("playlist"))
            return "Để tạo playlist mới, vào Your Library và click nút + ở góc trên bên phải!";

        if (msg.Contains("yêu thích") || msg.Contains("like"))
            return "Click vào icon trái tim ❤️ trên bài hát để thêm vào yêu thích!";

        if (msg.Contains("chia sẻ") || msg.Contains("share"))
            return "Click vào icon Share trên Player Bar để chia sẻ bài hát cho bạn bè!";

        if (msg.Contains("upload") || msg.Contains("tải lên"))
            return "Vào Import Music để tải nhạc của bạn lên. Hỗ trợ MP3, WAV, FLAC!";

        if (msg.Contains("gợi ý") || msg.Contains("recommend"))
            return "🌟 Gợi ý: Thử khám phá các thể loại nhạc khác nhau như Pop, Rock, EDM, Hip-hop!";

        return "Tôi có thể giúp bạn về:\n🎵 Tìm bài hát\n📚 Tạo playlist\n❤️ Yêu thích\n📤 Chia sẻ nhạc\n\nBạn cần gì?";
    }
}

public class ChatRequest
{
    public string Message { get; set; } = string.Empty;
}
