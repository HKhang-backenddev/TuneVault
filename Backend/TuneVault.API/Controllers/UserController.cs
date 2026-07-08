using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Users;
using TuneVault.Domain;
using TuneVault.Infrastructure;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : BaseApiController
{
    private readonly IMediator _mediator;
    private readonly TuneVaultDbContext _context;
    private readonly IWebHostEnvironment _env;

    public UserController(IMediator mediator, TuneVaultDbContext context, IWebHostEnvironment env)
    {
        _mediator = mediator;
        _context = context;
        _env = env;
    }

    /// <summary>Lấy hồ sơ người dùng đang đăng nhập.</summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = RequireUserId();
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });
        return Ok(await BuildProfileDtoAsync(user, userId));
    }

    /// <summary>Lấy hồ sơ theo username.</summary>
    [HttpGet("profile/{username}")]
    public async Task<IActionResult> GetProfileByUsername(string username)
    {
        var currentUserId = RequireUserId();
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });
        return Ok(await BuildProfileDtoAsync(user, currentUserId));
    }

    /// <summary>Cập nhật hồ sơ cá nhân.</summary>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfile request)
    {
        request.UserId = RequireUserId();
        await _mediator.Send(request);
        return Ok(new { message = "Cập nhật hồ sơ thành công." });
    }

    /// <summary>Tải ảnh đại diện.</summary>
    [HttpPost("avatar")]
    [RequestSizeLimit(10_000_000)]
    public Task<IActionResult> UploadAvatar(IFormFile file) => UploadImageAsync(file, isAvatar: true);

    /// <summary>Tải ảnh bìa.</summary>
    [HttpPost("banner")]
    [RequestSizeLimit(15_000_000)]
    public Task<IActionResult> UploadBanner(IFormFile file) => UploadImageAsync(file, isAvatar: false);

    /// <summary>Theo dõi / bỏ theo dõi người dùng.</summary>
    [HttpPost("{userId:guid}/follow")]
    public async Task<IActionResult> ToggleFollow(Guid userId)
    {
        var currentUserId = RequireUserId();
        if (currentUserId == userId)
            return BadRequest(new { message = "Bạn không thể theo dõi chính mình." });

        var target = await _context.Users.FindAsync(userId);
        if (target == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var existing = await _context.UserFollows
            .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == userId);

        if (existing != null)
        {
            _context.UserFollows.Remove(existing);
            await _context.SaveChangesAsync();
            return Ok(new { isFollowing = false, message = "Đã bỏ theo dõi." });
        }

        _context.UserFollows.Add(new UserFollow
        {
            FollowerId = currentUserId,
            FollowingId = userId,
            FollowedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        return Ok(new { isFollowing = true, message = "Đã theo dõi." });
    }

    /// <summary>Tìm kiếm người dùng.</summary>
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return Ok(Array.Empty<object>());

        var users = await _context.Users
            .Where(u => u.Username.Contains(query) ||
                        (u.DisplayName != null && u.DisplayName.Contains(query)) ||
                        u.Email.Contains(query))
            .Take(20)
            .Select(u => new
            {
                id = u.Id,
                username = u.Username,
                displayName = u.DisplayName ?? u.Username,
                avatarUrl = u.AvatarUrl
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>Danh sách bài hát được chia sẻ cho bạn.</summary>
    [HttpGet("shared-with-me")]
    public async Task<IActionResult> GetSharedWithMe()
    {
        var userId = RequireUserId();
        var items = await _mediator.Send(new GetSharedWithMeQuery(userId));
        return Ok(items);
    }

    /// <summary>Đặt chính mình làm Admin (chỉ dùng để test).</summary>
    [HttpPost("make-me-admin")]
    public async Task<IActionResult> MakeMeAdmin()
    {
        var userId = RequireUserId();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        user.Role = "Admin";
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User {user.Username} is now Admin!", role = user.Role });
    }

    /// <summary>Lấy role của người dùng hiện tại.</summary>
    [HttpGet("my-role")]
    public async Task<IActionResult> GetMyRole()
    {
        var userId = RequireUserId();
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        return Ok(new { username = user.Username, role = user.Role ?? "User" });
    }

    private async Task<object> BuildProfileDtoAsync(User user, Guid currentUserId)
    {
        var followerCount = await _context.UserFollows.CountAsync(f => f.FollowingId == user.Id);
        var followingCount = await _context.UserFollows.CountAsync(f => f.FollowerId == user.Id);
        var isFollowing = user.Id != currentUserId &&
            await _context.UserFollows.AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == user.Id);

        return new
        {
            id = user.Id,
            username = user.Username,
            email = user.Id == currentUserId ? user.Email : null,
            displayName = user.DisplayName ?? user.Username,
            avatarUrl = user.AvatarUrl,
            bannerUrl = user.BannerUrl,
            bio = user.Bio,
            location = user.Location,
            websiteUrl = user.WebsiteUrl,
            twitterUrl = user.TwitterUrl,
            githubUrl = user.GithubUrl,
            gender = user.Gender,
            dateOfBirth = user.DateOfBirth,
            createdAt = user.CreatedAt,
            lastUpdatedAt = user.LastUpdatedAt,
            followerCount,
            followingCount,
            isFollowing
        };
    }

    private async Task<IActionResult> UploadImageAsync(IFormFile file, bool isAvatar)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Vui lòng chọn ảnh." });

        var userId = RequireUserId();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var folder = Path.Combine(_env.ContentRootPath, "storage", "profile");
        Directory.CreateDirectory(folder);

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension)) extension = ".jpg";

        var fileName = $"{userId}_{(isAvatar ? "avatar" : "banner")}{extension}";
        var fullPath = Path.Combine(folder, fileName);

        await using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        var publicUrl = $"/media/profile/{fileName}";
        if (isAvatar) user.AvatarUrl = publicUrl;
        else user.BannerUrl = publicUrl;

        user.LastUpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { url = publicUrl, message = "Tải ảnh thành công." });
    }
}
