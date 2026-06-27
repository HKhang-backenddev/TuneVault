using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuneVault.API.Services;
using TuneVault.Application.Users;
using TuneVault.Domain;
using TuneVault.Infrastructure;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ImportController : BaseApiController
{
    private readonly IBackgroundTaskQueue _taskQueue;
    private readonly IYtDlpDownloader _downloader;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly INotificationService _notificationService;
    private readonly TuneVaultDbContext _context;

    public ImportController(
        IBackgroundTaskQueue taskQueue,
        IYtDlpDownloader downloader,
        IServiceScopeFactory scopeFactory,
        INotificationService notificationService,
        TuneVaultDbContext context)
    {
        _taskQueue = taskQueue;
        _downloader = downloader;
        _scopeFactory = scopeFactory;
        _notificationService = notificationService;
        _context = context;
    }

    /// <summary>Nhập nhạc từ YouTube (chạy nền).</summary>
    [HttpPost("import")]
    public IActionResult ImportFromYouTube([FromBody] ImportYouTubeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Url))
            return BadRequest(new { message = "URL YouTube không hợp lệ." });

        var userId = RequireUserId();
        var mediaId = Guid.NewGuid();
        var jobId = mediaId.ToString();

        _taskQueue.QueueBackgroundWorkItem(async ct =>
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<TuneVaultDbContext>();

            try
            {
                var (fileName, videoTitle, videoUploader, thumbnailUrl, durationSeconds) =
                    await _downloader.DownloadAudioAsync(request.Url, mediaId.ToString(), ct);

                var artist = await context.Artists.FirstOrDefaultAsync(a => a.Name == videoUploader, ct);
                if (artist == null)
                {
                    artist = new Artist
                    {
                        Id = Guid.NewGuid(),
                        Name = videoUploader,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Artists.Add(artist);
                }

                var mediaItem = new MediaItem
                {
                    Id = mediaId,
                    Title = string.IsNullOrWhiteSpace(request.Title) ? videoTitle : request.Title,
                    Type = MediaType.Audio,
                    DurationInSeconds = durationSeconds,
                    FilePath = fileName,
                    ThumbnailUrl = thumbnailUrl,
                    Genre = string.IsNullOrWhiteSpace(request.Genre) ? "YouTube" : request.Genre,
                    OwnerId = userId,
                    ArtistId = artist.Id,
                    CreatedAt = DateTime.UtcNow
                };

                context.MediaItems.Add(mediaItem);
                await context.SaveChangesAsync(ct);

                await _notificationService.SendNotificationAsync(
                    userId.ToString(),
                    $"Tải xong: {mediaItem.Title}",
                    "download_success",
                    ct);
            }
            catch (Exception ex)
            {
                await _notificationService.SendNotificationAsync(
                    userId.ToString(),
                    $"Tải YouTube thất bại: {ex.Message}",
                    "error",
                    ct);
            }
        });

        return Accepted(new { jobId, mediaId, message = "Đang tải nhạc từ YouTube..." });
    }

    /// <summary>Lịch sử tải nhạc.</summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userId = RequireUserId();

        var history = await _context.MediaItems
            .Where(m => m.OwnerId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new
            {
                id = m.Id,
                title = m.Title,
                createdAt = m.CreatedAt,
                status = "Completed",
                thumbnailUrl = m.ThumbnailUrl ?? "",
                durationSeconds = m.DurationInSeconds
            })
            .ToListAsync();

        return Ok(history);
    }
}

public record ImportYouTubeRequest(string Url, string? Title = null, string? Artist = null, string? Genre = null);
