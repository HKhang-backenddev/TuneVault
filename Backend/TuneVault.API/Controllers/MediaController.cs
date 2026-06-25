using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TuneVault.Infrastructure;
using TuneVault.Domain;
using System.Security.Claims;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/media")]
public class MediaController : ControllerBase
{
    private readonly TuneVaultDbContext _db;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public MediaController(TuneVaultDbContext db, IConfiguration config, IWebHostEnvironment env)
    {
        _db = db;
        _config = config;
        _env = env;
    }

    [HttpGet]
    [AllowAnonymous] // Cho phép truy cập công khai để tải dữ liệu trang chủ
    public IActionResult Get([FromQuery] string? query, [FromQuery] string? genre, [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    { // Thêm source vào query params
        try
        {
            var q = _db.MediaItems.Include(m => m.Artist).AsQueryable();

            // Get UserId from claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
            Guid? currentUserId = null;

            // Nếu có userId trong claim và parse thành công, chỉ lọc nhạc của người dùng đó
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var parsedId))
            {
                currentUserId = parsedId;
                q = q.Where(m => m.OwnerId == currentUserId);
            }
            
            // Tìm kiếm theo Title hoặc Artist Name
            if (!string.IsNullOrWhiteSpace(query)) {
                q = q.Where(m => m.Title.Contains(query) || (m.Artist != null && m.Artist.Name.Contains(query)));
            }
            
            // Tìm kiếm theo Thể loại
            if (!string.IsNullOrWhiteSpace(genre)) {
                q = q.Where(m => m.Genre == genre);
            }
            
            // Thêm bộ lọc theo Source
            // if (!string.IsNullOrWhiteSpace(source))
            // {
            //     q = q.Where(m => m.Source == source);
            // }

            var totalCount = q.Count();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var list = q
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new { 
                id = m.Id,
                title = m.Title,
                artist = m.Artist != null ? m.Artist.Name : null,
                createdAt = m.CreatedAt,
                url = "/api/media/stream/" + m.Id,
                thumbnailUrl = !string.IsNullOrEmpty(m.ThumbnailUrl) 
                    ? m.ThumbnailUrl 
                    : "/assets/default-cover.png",
                genre = m.Genre,
                durationInSeconds = m.DurationInSeconds,
                isLiked = (currentUserId.HasValue && _db.Favorites.Any(f => f.UserId == currentUserId.Value && f.MediaItemId == m.Id))
            }).ToList();

            return Ok(new { 
                items = list, 
                totalCount, 
                page, 
                pageSize,
                totalPages
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in Get Media: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    public class MediaUploadRequest
    {
        public IFormFile File { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Genre { get; set; } = null!;
        public Guid? ArtistId { get; set; }
    }

    [HttpPost("upload")]
    [Authorize] // Yêu cầu đăng nhập để tải lên
    public async Task<IActionResult> Upload([FromForm] MediaUploadRequest req)
    {
        if (req.File == null || req.File.Length == 0) return BadRequest("Vui lòng chọn tệp.");
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest("Tiêu đề không được để trống.");

        try
        {
            var storagePath = Path.GetFullPath(_config["Storage:MediaPath"] ?? Path.Combine(_env.ContentRootPath, "storage", "media"));
            Directory.CreateDirectory(storagePath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(req.File.FileName)}";
            var filePath = Path.Combine(storagePath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await req.File.CopyToAsync(stream);
            }

            // 2. Lưu vào Database
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
            {
                return Unauthorized(new { message = "Không thể xác định người dùng để tải lên." });
            }

            var mediaItem = new MediaItem
            {
                Id = Guid.NewGuid(),
                Title = req.Title,
                Genre = req.Genre,
                FilePath = fileName,
                CreatedAt = DateTime.UtcNow,
                OwnerId = currentUserId,
                ArtistId = req.ArtistId,
                Type = req.File.ContentType.StartsWith("video") ? (MediaType)1 : (MediaType)0
            };

            _db.MediaItems.Add(mediaItem);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Tải lên thành công", id = mediaItem.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("save/{id}")]
    [Authorize] // Yêu cầu người dùng phải đăng nhập
    public async Task<IActionResult> SaveSharedMedia(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
        {
            return Unauthorized(new { message = "Không thể xác định người dùng." });
        }

        // Tìm bài hát gốc
        var originalMedia = await _db.MediaItems.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        if (originalMedia == null)
        {
            return NotFound(new { message = "Không tìm thấy bài hát gốc để lưu." });
        }

        // Kiểm tra xem bài hát đã tồn tại trong thư viện của người dùng chưa (dựa trên FilePath)
        var existingMedia = await _db.MediaItems.FirstOrDefaultAsync(m => m.OwnerId == currentUserId && m.FilePath == originalMedia.FilePath);
        if (existingMedia != null)
        {
            return Conflict(new { message = "Bài hát này đã có trong thư viện của bạn." });
        }

        // Tạo một bản sao của MediaItem cho người dùng hiện tại
        var newMediaItem = new MediaItem
        {
            Id = Guid.NewGuid(),
            Title = originalMedia.Title,
            Genre = originalMedia.Genre,
            FilePath = originalMedia.FilePath, // Dùng chung file vật lý
            ThumbnailUrl = originalMedia.ThumbnailUrl,
            DurationInSeconds = originalMedia.DurationInSeconds,
            CreatedAt = DateTime.UtcNow, // Thời gian tạo là bây giờ
            OwnerId = currentUserId, // Gán cho người dùng hiện tại
            ArtistId = originalMedia.ArtistId,
            Type = originalMedia.Type,
        };

        _db.MediaItems.Add(newMediaItem);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã lưu bài hát vào thư viện của bạn.", newMediaId = newMediaItem.Id });
    }

    [HttpDelete("{id}")]
    [Authorize] // Yêu cầu đăng nhập để xóa
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var item = await _db.MediaItems.FindAsync(id);
            if (item == null) return NotFound(new { message = "Không tìm thấy bài hát" });

            // 1. Xóa file vật lý trên ổ đĩa
            var storagePath = Path.GetFullPath(_config["Storage:MediaPath"] ?? Path.Combine(_env.ContentRootPath, "storage", "media"));
            var filePath = Path.Combine(storagePath, item.FilePath);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            _db.MediaItems.Remove(item);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Đã xóa bài hát và file thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("stream/{id}")]
    [AllowAnonymous] // Cho phép phát nhạc công khai, token có thể được truyền qua query string nếu cần
    public async Task<IActionResult> Stream(Guid id)
    {
        try
        {
            Console.WriteLine($">>> Yêu cầu phát nhạc cho ID: {id}");
            var item = await _db.MediaItems.FindAsync(id);
            if (item == null) return NotFound(new { message = "Không tìm thấy bài hát trong cơ sở dữ liệu." });

            var storagePath = Path.GetFullPath(_config["Storage:MediaPath"] ?? Path.Combine(_env.ContentRootPath, "storage", "media"));
            var filePath = Path.Combine(storagePath, item.FilePath);

            Console.WriteLine($">>> Đường dẫn file: {filePath}");

            if (!System.IO.File.Exists(filePath)) 
                return NotFound(new { message = $"File nhạc không tồn tại trên ổ đĩa vật lý: {item.FilePath}" });

            var fileInfo = new System.IO.FileInfo(filePath);
            if (fileInfo.Length == 0) 
                return BadRequest(new { message = "File nhạc bị lỗi (0 bytes). Vui lòng tải lại bài hát này." });

            var contentType = item.Type == MediaType.Audio ? "audio/mpeg" : "video/mp4";
            return PhysicalFile(filePath, contentType, enableRangeProcessing: true);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"!!! LỖI STREAM NHẠC: {ex.Message}");
            return StatusCode(500, new { message = "Lỗi hệ thống khi truy xuất file nhạc.", detail = ex.Message });
        }
    }
}
