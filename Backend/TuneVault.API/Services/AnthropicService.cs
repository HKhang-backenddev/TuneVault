using System.Net.Http.Json;
using TuneVault.Application.Common;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace TuneVault.API.Services;

public class AnthropicService : IAnthropicService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public AnthropicService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _apiKey = config["Anthropic:ApiKey"] ?? "";
    }

    public async Task<string> GetAiSuggestionAsync(string prompt)
    {
        if (string.IsNullOrEmpty(_apiKey)) return "AI service is not configured.";

        var body = new
        {
            model = "claude-3-sonnet-20240229",
            max_tokens = 512,
            messages = new[] { new { role = "user", content = prompt } }
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
        req.Headers.Add("x-api-key", _apiKey);
        req.Headers.Add("anthropic-version", "2023-06-01");
        req.Content = JsonContent.Create(body);

        try
        {
            var res = await _http.SendAsync(req);
            var data = await res.Content.ReadFromJsonAsync<dynamic>();
            return data?.content[0]?.text ?? "No suggestion available.";
        }
        catch { return "AI suggestion failed."; }
    }
}