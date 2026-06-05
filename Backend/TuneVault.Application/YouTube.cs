using MediatR;
using System.Diagnostics;

namespace TuneVault.Application.YouTube;

public record SearchYouTubeQuery(string Query, int Limit = 10) : IRequest<List<YouTubeVideoDto>>;

public record YouTubeVideoDto(string Id, string Title, string ChannelName, int DurationSeconds, string ThumbnailUrl);

public class SearchYouTubeHandler : IRequestHandler<SearchYouTubeQuery, List<YouTubeVideoDto>>
{
    public async Task<List<YouTubeVideoDto>> Handle(SearchYouTubeQuery request, CancellationToken cancellationToken)
    {
        var result = new List<YouTubeVideoDto>();
        
        try
        {
            // Sử dụng yt-dlp để tìm kiếm YouTube
            var processInfo = new ProcessStartInfo
            {
                FileName = "yt-dlp",
                Arguments = $"\"ytsearch{request.Limit}:{request.Query}\" --dump-json -x",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using (var process = Process.Start(processInfo))
            {
                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();
                
                if (!string.IsNullOrEmpty(error))
                {
                    throw new InvalidOperationException($"yt-dlp error: {error}");
                }

                // Parse JSON output (simple parsing)
                var lines = output.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    try
                    {
                        var video = System.Text.Json.JsonSerializer.Deserialize<dynamic>(line);
                        // Note: Real implementation would parse properly
                    }
                    catch { }
                }
            }
        }
        catch (Exception ex)
        {
            // Fallback: return empty or handle gracefully
            System.Diagnostics.Debug.WriteLine($"YouTube search failed: {ex.Message}");
        }

        return result;
    }
}

public record GetYouTubeStreamUrlQuery(string VideoId) : IRequest<string>;

public class GetYouTubeStreamUrlHandler : IRequestHandler<GetYouTubeStreamUrlQuery, string>
{
    public async Task<string> Handle(GetYouTubeStreamUrlQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Sử dụng yt-dlp để lấy audio stream URL
            var processInfo = new ProcessStartInfo
            {
                FileName = "yt-dlp",
                Arguments = $"-f bestaudio --get-url \"https://www.youtube.com/watch?v={request.VideoId}\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using (var process = Process.Start(processInfo))
            {
                var streamUrl = await process.StandardOutput.ReadLineAsync();
                await process.WaitForExitAsync(cancellationToken);
                
                if (string.IsNullOrEmpty(streamUrl))
                {
                    throw new InvalidOperationException("Failed to get stream URL");
                }

                return streamUrl;
            }
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to get YouTube stream: {ex.Message}");
        }
    }
}
