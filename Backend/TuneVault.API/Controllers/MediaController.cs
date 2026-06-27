using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Media;
using TuneVault.Domain;
using TuneVault.Infrastructure;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaController : BaseApiController
{
    private readonly IMediator _mediator;
    private readonly TuneVaultDbContext _context;
    private readonly IWebHostEnvironment _env;

    public MediaController(IMediator mediator, TuneVaultDbContext context, IWebHostEnvironment env)
    {
        _mediator = mediator;
        _context = context;
        _env = env;
    }

    /// <summary>Danh sách bài hát (hỗ trợ tìm kiếm, phân trang, lọc thể loại).</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetMedia(
        [FromQuery] string? query,
        [FromQuery] string? genre,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();

        if (!string.IsNullOrWhiteSpace(genre))
        {
            var genreQuery = _context.MediaItems
                .Include(m => m.Artist)
                .Where(m => m.Genre == genre);

            if (!string.IsNullOrWhiteSpace(query))
            {
                genreQuery = genreQuery.Where(m =>
                    m.Title.Contains(query) ||
                    (m.Artist != null && m.Artist.Name.Contains(query)));
            }

            var totalGenre = await genreQuery.CountAsync();
            var genreItems = await genreQuery
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var mappedGenre = await MapMediaItemsAsync(genreItems, userId);
            return Ok(new { items = mappedGenre, total = totalGenre, page, pageSize });
        }

        var result = await _mediator.Send(new GetSongsQuery(query, page, pageSize));
        var items = await MapSongsAsync(result.Songs, userId);
        return Ok(new { items, total = result.Total, page = result.Page, pageSize = result.PageSize });
    }

    /// <summary>Thư viện cá nhân — chỉ bài hát của user đang đăng nhập.</summary>
    [HttpGet("library")]
    [Authorize]
    public async Task<IActionResult> GetLibrary(
        [FromQuery] string? query,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        var userId = RequireUserId();

        var libraryQuery = _context.MediaItems
            .Include(m => m.Artist)
            .Where(m => m.OwnerId == userId);

        if (!string.IsNullOrWhiteSpace(query))
        {
            libraryQuery = libraryQuery.Where(m =>
                m.Title.Contains(query) ||
                (m.Artist != null && m.Artist.Name.Contains(query)));
        }

        var total = await libraryQuery.CountAsync();
        var items = await libraryQuery
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var mapped = await MapMediaItemsAsync(items, userId);
        return Ok(new { items = mapped, total, page, pageSize });
    }

    /// <summary>Stream file nhạc theo ID.</summary>
    [HttpGet("stream/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> Stream(Guid id)
    {
        var media = await _context.MediaItems.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        if (media == null) return NotFound(new { message = "Không tìm thấy bài hát." });

        var storagePath = Path.Combine(_env.ContentRootPath, "storage", "media");
        var filePath = Path.Combine(storagePath, media.FilePath);
        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = "File nhạc không tồn tại trên máy chủ." });

        return PhysicalFile(filePath, "audio/mpeg", enableRangeProcessing: true);
    }

    /// <summary>Tải file nhạc lên thư viện.</summary>
    [HttpPost("upload")]
    [Authorize]
    [RequestSizeLimit(100_000_000)]
    public async Task<IActionResult> Upload(
        IFormFile file,
        [FromForm] string title,
        [FromForm] string? artist,
        [FromForm] string genre = "Pop")
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Vui lòng chọn file nhạc." });

        var userId = RequireUserId();
        var mediaId = Guid.NewGuid();
        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension)) extension = ".mp3";

        var fileName = $"{mediaId}{extension}";
        var storagePath = Path.Combine(_env.ContentRootPath, "storage", "media");
        Directory.CreateDirectory(storagePath);
        var fullPath = Path.Combine(storagePath, fileName);

        await using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        var artistEntity = await GetOrCreateArtistAsync(artist ?? "Unknown Artist");

        var mediaItem = new MediaItem
        {
            Id = mediaId,
            Title = string.IsNullOrWhiteSpace(title) ? Path.GetFileNameWithoutExtension(file.FileName) : title,
            Type = MediaType.Audio,
            DurationInSeconds = 0,
            FilePath = fileName,
            Genre = string.IsNullOrWhiteSpace(genre) ? "Pop" : genre,
            OwnerId = userId,
            ArtistId = artistEntity?.Id,
            CreatedAt = DateTime.UtcNow
        };

        _context.MediaItems.Add(mediaItem);
        await _context.SaveChangesAsync();

        return Ok(new { id = mediaItem.Id, message = "Tải lên thành công." });
    }

    /// <summary>Lưu bài hát được chia sẻ vào thư viện cá nhân.</summary>
    [HttpPost("save/{mediaId:guid}")]
    [Authorize]
    public async Task<IActionResult> SaveShared(Guid mediaId)
    {
        var userId = RequireUserId();
        var source = await _context.MediaItems
            .Include(m => m.Artist)
            .FirstOrDefaultAsync(m => m.Id == mediaId);

        if (source == null)
            return NotFound(new { message = "Không tìm thấy bài hát." });

        if (source.OwnerId == userId)
            return Ok(new { message = "Bài hát đã có trong thư viện của bạn." });

        var exists = await _context.MediaItems.AnyAsync(m =>
            m.OwnerId == userId && m.FilePath == source.FilePath && m.Title == source.Title);

        if (exists)
            return Ok(new { message = "Bài hát đã được lưu trước đó." });

        var copy = new MediaItem
        {
            Id = Guid.NewGuid(),
            Title = source.Title,
            Description = source.Description,
            Type = source.Type,
            DurationInSeconds = source.DurationInSeconds,
            FilePath = source.FilePath,
            ThumbnailUrl = source.ThumbnailUrl,
            Genre = source.Genre,
            OwnerId = userId,
            ArtistId = source.ArtistId,
            AlbumId = source.AlbumId,
            CreatedAt = DateTime.UtcNow
        };

        _context.MediaItems.Add(copy);
        await _context.SaveChangesAsync();

        return Ok(new { id = copy.Id, message = "Đã lưu bài hát vào thư viện." });
    }

    /// <summary>Xóa bài hát khỏi thư viện.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = RequireUserId();
        var media = await _context.MediaItems
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);
        if (media == null)
            return NotFound(new { message = "Không tìm thấy bài hát." });

        var fileMissing = !MediaFileExists(media.FilePath);
        var isOwner = media.OwnerId == userId;
        if (!isOwner && !fileMissing)
            return NotFound(new { message = "Bạn chỉ có thể xóa bài hát của mình hoặc bài hát bị lỗi (không phát được)." });

        var filePath = media.FilePath;

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            await _context.MediaShares.Where(s => s.MediaItemId == id).ExecuteDeleteAsync();
            await _context.Favorites.Where(f => f.MediaItemId == id).ExecuteDeleteAsync();
            await _context.PlayHistories.Where(p => p.MediaItemId == id).ExecuteDeleteAsync();
            await _context.PlaylistTracks.Where(pt => pt.MediaItemId == id).ExecuteDeleteAsync();

            var deleted = await _context.MediaItems
                .Where(m => m.Id == id)
                .ExecuteDeleteAsync();

            if (deleted == 0)
            {
                await transaction.RollbackAsync();
                return NotFound(new { message = "Không tìm thấy bài hát." });
            }

            await transaction.CommitAsync();
        }
        catch (DbUpdateException ex)
        {
            await transaction.RollbackAsync();
            var detail = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(new { message = "Không thể xóa bài hát do còn dữ liệu liên quan.", detail });
        }

        var othersUseFile = await _context.MediaItems.AnyAsync(m => m.FilePath == filePath);
        if (!othersUseFile && !fileMissing)
        {
            var storagePath = Path.Combine(_env.ContentRootPath, "storage", "media");
            var fullPath = Path.Combine(storagePath, filePath);
            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);
        }

        return Ok(new { message = "Đã xóa bài hát." });
    }

    private bool MediaFileExists(string filePath)
    {
        var storagePath = Path.Combine(_env.ContentRootPath, "storage", "media");
        var fullPath = Path.Combine(storagePath, filePath);
        return System.IO.File.Exists(fullPath);
    }

    private async Task<List<object>> MapSongsAsync(IEnumerable<SongDto> songs, Guid? userId)
    {
        var songList = songs.ToList();
        var ids = songList.Select(s => s.Id).ToList();
        var likedIds = userId.HasValue
            ? await _context.Favorites
                .Where(f => f.UserId == userId.Value && ids.Contains(f.MediaItemId))
                .Select(f => f.MediaItemId)
                .ToListAsync()
            : [];

        var metaMap = await _context.MediaItems
            .Where(m => ids.Contains(m.Id))
            .Select(m => new { m.Id, m.OwnerId, m.FilePath })
            .ToDictionaryAsync(x => x.Id);

        return songList.Select(s =>
        {
            metaMap.TryGetValue(s.Id, out var meta);
            var isOwner = userId.HasValue && meta != null && meta.OwnerId == userId.Value;
            var fileBroken = meta != null && !MediaFileExists(meta.FilePath);
            return new
            {
                id = s.Id,
                title = s.Title,
                artist = s.ArtistName ?? "Nghệ sĩ không xác định",
                url = $"/api/media/stream/{s.Id}",
                thumbnailUrl = s.ThumbnailUrl ?? "",
                durationInSeconds = s.DurationInSeconds,
                genre = s.Genre,
                isLiked = likedIds.Contains(s.Id),
                isOwner,
                canDelete = userId.HasValue && (isOwner || fileBroken)
            };
        }).Cast<object>().ToList();
    }

    private async Task<List<object>> MapMediaItemsAsync(IEnumerable<MediaItem> items, Guid? userId)
    {
        var list = items.ToList();
        var ids = list.Select(m => m.Id).ToList();
        var likedIds = userId.HasValue
            ? await _context.Favorites
                .Where(f => f.UserId == userId.Value && ids.Contains(f.MediaItemId))
                .Select(f => f.MediaItemId)
                .ToListAsync()
            : [];

        return list.Select(m =>
        {
            var fileBroken = !MediaFileExists(m.FilePath);
            var isOwner = userId.HasValue && m.OwnerId == userId.Value;
            return new
            {
                id = m.Id,
                title = m.Title,
                artist = m.Artist?.Name ?? "Nghệ sĩ không xác định",
                url = $"/api/media/stream/{m.Id}`",
                thumbnailUrl = m.ThumbnailUrl ?? "",
                durationInSeconds = m.DurationInSeconds,
                genre = m.Genre,
                isLiked = likedIds.Contains(m.Id),
                isOwner,
                canDelete = userId.HasValue && (isOwner || fileBroken)
            };
        }).Cast<object>().ToList();
    }

    private async Task<Artist?> GetOrCreateArtistAsync(string artistName)
    {
        var normalized = artistName.Trim();
        if (string.IsNullOrWhiteSpace(normalized)) return null;

        var artist = await _context.Artists.FirstOrDefaultAsync(a => a.Name == normalized);
        if (artist != null) return artist;

        artist = new Artist
        {
            Id = Guid.NewGuid(),
            Name = normalized,
            CreatedAt = DateTime.UtcNow
        };
        _context.Artists.Add(artist);
        await _context.SaveChangesAsync();
        return artist;
    }
}
