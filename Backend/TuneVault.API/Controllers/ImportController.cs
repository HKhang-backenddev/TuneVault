using Microsoft.AspNetCore.Mvc;
using TuneVault.Infrastructure;
using TuneVault.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using TuneVault.API.Hubs;
using TuneVault.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims; // Added for ClaimTypes
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Microsoft.Extensions.DependencyInjection;

namespace TuneVault.API.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class ImportController : ControllerBase
{
    private readonly IYtDlpDownloader _downloader;
    private readonly TuneVaultDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IServiceScopeFactory _scopeFactory;

    public ImportController(IYtDlpDownloader downloader, TuneVaultDbContext context, IHubContext<NotificationHub> hubContext, IServiceScopeFactory scopeFactory)
    {
        _downloader = downloader;
        _context = context;
        _hubContext = hubContext;
        _scopeFactory = scopeFactory;
    }

    [HttpGet("check")]
    public IActionResult CheckDependencies()
    {
        var errors = new List<string>();
        
        try
        {
            using var proc = System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo("yt-dlp", "--version") 
            { RedirectStandardOutput = true, UseShellExecute = false, CreateNoWindow = true });
            var output = proc?.StandardOutput?.ReadToEnd()?.Trim();
            proc?.WaitForExit(5000);
            if (proc?.ExitCode != 0 || string.IsNullOrEmpty(output))
                errors.Add("yt-dlp không hoạt động. Hãy cài: winget install yt-dlp");
            else
                Console.WriteLine($">>> yt-dlp version: {output}");
        }
        catch (Exception ex) { errors.Add($"yt-dlp error: {ex.Message}"); }

        try
        {
            using var proc = System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo("ffmpeg", "-version") 
            { RedirectStandardOutput = true, UseShellExecute = false, CreateNoWindow = true });
            var output = proc?.StandardOutput?.ReadToEnd()?.Trim();
            proc?.WaitForExit(5000);
            if (proc?.ExitCode != 0 || string.IsNullOrEmpty(output))
                errors.Add("FFmpeg không hoạt động. Hãy cài: winget install ffmpeg");
        }
        catch (Exception ex) { errors.Add($"FFmpeg error: {ex.Message}"); }

        if (errors.Count > 0)
            return Ok(new { status = "error", errors });

        return Ok(new { status = "ok" });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        Guid userId;

        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out userId))
        {
            var firstUser = await _context.Users.FirstOrDefaultAsync();
            if (firstUser == null) return BadRequest();
            userId = firstUser.Id;
        }
        Console.WriteLine($">>> GetHistory: Querying for userId: {userId}");

        var history = await _context.MediaItems
        .Where(m => m.Genre == "YouTube" && m.OwnerId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(10)
            .Select(m => new {
                id = m.Id,
                title = m.Title,
                createdAt = m.CreatedAt,
                thumbnailUrl = !string.IsNullOrEmpty(m.ThumbnailUrl) 
                    ? m.ThumbnailUrl 
                    : "https://www.gstatic.com/youtube/img/branding/favicon/favicon_144x144.png",
                durationSeconds = m.DurationInSeconds,
                status = "Completed"
            })
            .ToListAsync();

        return Ok(history);
    }

    [HttpPost("import")]
    public async Task<IActionResult> ImportFromYoutube([FromBody] ImportRequest request)
    {
        if (string.IsNullOrEmpty(request.Url)) 
            return BadRequest(new { message = "Vui lòng cung cấp link YouTube hợp lệ." });

        // Dùng Regex để TRÍCH XUẤT link YouTube (Bất kể bạn dán kèm rác gì xung quanh)
        // Hỗ trợ: youtube.com, youtu.be, youtube.com/shorts
        var youtubeMatch = Regex.Match(request.Url, @"(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|shorts\/|v\/|embed\/)?([a-zA-Z0-9_-]{11})");
        
        if (!youtubeMatch.Success)
        {
            return BadRequest(new { message = "Link không đúng định dạng YouTube." });
        }

        // Lấy video ID và tạo lại một link sạch, không chứa playlist hay các tham số khác
        string videoId = youtubeMatch.Groups[1].Value;
        string cleanedUrl = $"https://www.youtube.com/watch?v={videoId}";
        if (!cleanedUrl.StartsWith("http")) cleanedUrl = "https://" + cleanedUrl;
        request.Url = cleanedUrl;

        // Lấy UserId từ claims
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        Guid userId;

        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out userId))
        {
            // Nếu dùng dummy-token, lấy đại User đầu tiên trong DB để test
            var firstUser = await _context.Users.FirstOrDefaultAsync();
            if (firstUser == null) return BadRequest(new { message = "Hệ thống chưa có người dùng nào." });
            userId = firstUser.Id;
        }
        Console.WriteLine($">>> ImportFromYoutube: Saving with userId: {userId}");

        try
        {
            // 1. Tạo ID duy nhất cho bài hát
            var mediaId = Guid.NewGuid();

            // Nếu yêu cầu debug, chạy đồng bộ và trả lỗi chi tiết để dễ debug
            if (request.Debug)
            {
                string downloadUrl = request.Url;
                string? reqTitle = request.Title;
                string? reqArtist = request.Artist;
                string? reqGenre = request.Genre;
                string currentTitle = "YouTube Track";

                try
                {
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<TuneVaultDbContext>();
                        var downloader = scope.ServiceProvider.GetRequiredService<IYtDlpDownloader>();

                        await _hubContext.Clients.All.SendAsync("ReceiveNotification", new { type = "info", message = "Bắt đầu tải nhạc từ YouTube (debug)..." });
                        Console.WriteLine($">>> ImportController (debug): Bắt đầu DownloadAudioAsync cho URL: {downloadUrl} với Title: '{reqTitle}'");

                        var (fileName, title, uploader, thumbnailUrl, durationSeconds) = await downloader.DownloadAudioAsync(downloadUrl, mediaId.ToString(), default);
                        currentTitle = title ?? currentTitle;
                        var finalTitle = !string.IsNullOrWhiteSpace(reqTitle) ? reqTitle.Trim() : (title ?? "YouTube Track");

                        // Artist handling
                        Guid? artistId = null;
                        var artistName = !string.IsNullOrWhiteSpace(reqArtist) ? reqArtist : (!string.IsNullOrWhiteSpace(uploader) ? uploader : null);

                        if (!string.IsNullOrEmpty(artistName))
                        {
                            var artist = await dbContext.Artists.FirstOrDefaultAsync(a => a.Name == artistName);
                            if (artist == null)
                            {
                                artist = new Artist { Id = Guid.NewGuid(), Name = artistName };
                                dbContext.Artists.Add(artist);
                                await dbContext.SaveChangesAsync();
                            }
                            artistId = artist.Id;
                        }

                        var media = new MediaItem
                        {
                            Id = mediaId,
                            Title = finalTitle,
                            Genre = "YouTube", // SỬA LỖI: Luôn gán Genre là YouTube để lịch sử hoạt động
                            FilePath = fileName,
                            ThumbnailUrl = thumbnailUrl,
                            CreatedAt = DateTime.UtcNow,
                            OwnerId = userId,
                            ArtistId = artistId,
                            Type = MediaType.Audio,
                            DurationInSeconds = durationSeconds
                        };

                        dbContext.MediaItems.Add(media);
                        await dbContext.SaveChangesAsync();
                        Console.WriteLine($">>> ImportController (debug): Đã lưu vào DB thành công. Title: {finalTitle}, ArtistId: {artistId}");

                        await _hubContext.Clients.All.SendAsync("ReceiveNotification", new { type = "success", message = $"Tải thành công: {finalTitle}", refresh = true });
                        return Accepted(new { message = "Đã tải xong (debug)", title = finalTitle });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"!!! LỖI DEBUG IMPORT: {ex.Message}");
                    return StatusCode(500, new { message = "Lỗi khi tải nhạc (debug): " + ex.Message });
                }
            }

            // 2. CHẠY NGẦM (Background Task)
            _ = Task.Run(async () =>
            {
                // Capture các thông tin cần thiết từ request trước khi luồng chính kết thúc
                string downloadUrl = request.Url;
                string? reqTitle = request.Title;
                string? reqArtist = request.Artist;
                string? reqGenre = request.Genre;
                string currentTitle = "YouTube Track";

                try
                {
                    using (var scope = _scopeFactory.CreateScope())
                    {                        
                        var dbContext = scope.ServiceProvider.GetRequiredService<TuneVaultDbContext>();
                        var downloader = scope.ServiceProvider.GetRequiredService<IYtDlpDownloader>();

                        await _hubContext.Clients.All.SendAsync("ReceiveNotification", new { type = "info", message = "Bắt đầu tải nhạc từ YouTube..." });
                        Console.WriteLine($">>> ImportController: Bắt đầu DownloadAudioAsync cho URL: {downloadUrl} với Title: '{reqTitle}'");
                        
                        // 1. Tải file và lấy thông tin
                        var (fileName, title, uploader, thumbnailUrl, durationSeconds) = await downloader.DownloadAudioAsync(downloadUrl, mediaId.ToString(), default);
                        currentTitle = !string.IsNullOrWhiteSpace(reqTitle) ? reqTitle.Trim() : (title ?? "YouTube Track");
                        var finalTitle = !string.IsNullOrWhiteSpace(reqTitle) ? reqTitle : (title ?? "YouTube Track");
                        
                        // 2. Xử lý Artist
                        Guid? artistId = null;
                        var artistName = !string.IsNullOrWhiteSpace(reqArtist) ? reqArtist : (!string.IsNullOrWhiteSpace(uploader) ? uploader : null);

                        if (!string.IsNullOrEmpty(artistName))
                        {
                            var artist = await dbContext.Artists.FirstOrDefaultAsync(a => a.Name == artistName);
                            if (artist == null)
                            {   
                                // Nếu nghệ sĩ chưa tồn tại, tạo mới và LƯU NGAY LẬP TỨC
                                artist = new Artist { Id = Guid.NewGuid(), Name = artistName };
                                dbContext.Artists.Add(artist);
                                await dbContext.SaveChangesAsync();
                            }
                            artistId = artist.Id;
                        }
                        
                        // 3. Tạo và lưu MediaItem
                        var media = new MediaItem 
                        {
                            Id = mediaId,
                            Title = finalTitle,
                            Genre = "YouTube", // SỬA LỖI: Luôn gán Genre là YouTube để lịch sử hoạt động
                            FilePath = fileName,
                            ThumbnailUrl = thumbnailUrl,
                            CreatedAt = DateTime.UtcNow,
                            OwnerId = userId,
                            ArtistId = artistId, // Gán ID của nghệ sĩ đã tồn tại hoặc vừa được tạo
                            Type = MediaType.Audio,
                            DurationInSeconds = durationSeconds
                        };

                        dbContext.MediaItems.Add(media);
                        await dbContext.SaveChangesAsync();
                        Console.WriteLine($">>> ImportController: Đã lưu vào DB thành công. Title: {finalTitle}, ArtistId: {artistId}");

                        // Chỉ báo thành công khi file đã tồn tại trên đĩa VÀ DB đã cập nhật xong
                        await _hubContext.Clients.All.SendAsync("ReceiveNotification", new { type = "success", message = $"Tải thành công: {finalTitle}", refresh = true });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"!!! LỖI BACKGROUND TASK: {ex.Message}");
                    await _hubContext.Clients.All.SendAsync("ReceiveNotification", new { type = "error", message = $"Lỗi tải [{currentTitle}]: " + ex.Message });
                }
            });

            // Trả về ngay lập tức để Frontend không bị Timeout
            return Accepted(new { message = "Yêu cầu đã được tiếp nhận. Vui lòng đợi trong giây lát." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Import Error: {ex.Message}");
            return StatusCode(500, new { message = "Lỗi khi tải nhạc: " + ex.Message });
        }
    }
}

public class ImportRequest 
{ 
    public string Url { get; set; } = string.Empty; 
    public string? Title { get; set; }
    public string? Artist { get; set; }
    public string? Genre { get; set; }
    // Set to true to run download synchronously and return errors directly (debug only)
    public bool Debug { get; set; } = false;
}
