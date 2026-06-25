using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.Application.Users;
using TuneVault.Infrastructure;
using Microsoft.AspNetCore.SignalR;
using TuneVault.API.Hubs;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace TuneVault.API.Controllers;

// DTO giúp Swagger và .NET nhận diện file upload chính xác hơn
public class FileUploadRequest
{
    public IFormFile File { get; set; } = null!;
}

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly TuneVaultDbContext _context;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserController(IMediator mediator, TuneVaultDbContext context, IConfiguration config, IWebHostEnvironment env, IHubContext<NotificationHub> hubContext, IHttpContextAccessor httpContextAccessor)
    {
        _mediator = mediator;
        _context = context;
        _config = config;
        _env = env;
        _hubContext = hubContext;
        _httpContextAccessor = httpContextAccessor;
    }

    // Endpoint lấy thông tin hồ sơ
    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        // Hỗ trợ cả Claim chuẩn SOAP và chuẩn JWT (sub)
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        if (userIdClaim == null) return Unauthorized();

        if (!Guid.TryParse(userIdClaim.Value, out var userId)) return Unauthorized();

        // Truy vấn trực tiếp từ Database để lấy dữ liệu mới nhất (DisplayName, Bio, Avatar...)
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) 
            return NotFound(new { message = "Người dùng không tồn tại." });

        var currentUserId = Guid.Parse(userIdClaim.Value);

        var request = _httpContextAccessor.HttpContext!.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";

        return Ok(new { 
            user.Id,
            username = user.Username,
            email = user.Email,
            displayName = user.DisplayName ?? user.Username,
            bio = user.Bio,
            avatarUrl = !string.IsNullOrEmpty(user.AvatarUrl) && user.AvatarUrl.StartsWith("/")
                ? $"{baseUrl}{user.AvatarUrl}" 
                : user.AvatarUrl, // Giữ nguyên nếu là URL tuyệt đối
            bannerUrl = user.BannerUrl,
            location = user.Location,
            websiteUrl = user.WebsiteUrl,
            twitterUrl = user.TwitterUrl,
            githubUrl = user.GithubUrl,
            createdAt = user.CreatedAt, // Đã thêm lại
            lastUpdatedAt = user.LastUpdatedAt,
            gender = user.Gender,
            dateOfBirth = user.DateOfBirth,
            followerCount = await _context.Follows.CountAsync(f => f.TargetUserId == userId),
            followingCount = await _context.Follows.CountAsync(f => f.FollowerId == userId),
            isFollowing = await _context.Follows.AnyAsync(f => f.FollowerId == currentUserId && f.TargetUserId == userId)
        });
    }

    // NEW: Get profile by username
    [AllowAnonymous] // Allow anyone to view profiles
    [HttpGet("profile/{username}")]
    public async Task<IActionResult> GetProfileByUsername(string username)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng này." });
        }

        var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        Guid.TryParse(currentUserIdClaim?.Value, out var currentUserId);

        var request = _httpContextAccessor.HttpContext!.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";

        return Ok(new
        {
            user.Id,
            username = user.Username,
            email = user.Email,
            displayName = user.DisplayName ?? user.Username,
            bio = user.Bio,
            avatarUrl = !string.IsNullOrEmpty(user.AvatarUrl) && user.AvatarUrl.StartsWith("/") ? $"{baseUrl}{user.AvatarUrl}" : user.AvatarUrl,
            bannerUrl = user.BannerUrl,
            location = user.Location,
            websiteUrl = user.WebsiteUrl,
            createdAt = user.CreatedAt,
            followerCount = await _context.Follows.CountAsync(f => f.TargetUserId == user.Id),
            followingCount = await _context.Follows.CountAsync(f => f.FollowerId == user.Id),
            isFollowing = currentUserId != Guid.Empty && await _context.Follows.AnyAsync(f => f.FollowerId == currentUserId && f.TargetUserId == user.Id)
        });
    }

    [Authorize]
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar([FromForm] FileUploadRequest request)
    {
        var file = request.File;
        if (file == null || file.Length == 0) return BadRequest("Tệp không hợp lệ.");
        
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId)) return Unauthorized();

        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Người dùng không tồn tại." });

            // Lưu vào thư mục storage/avatars
            var storagePath = Path.Combine(_env.ContentRootPath, "storage", "avatars");
            Directory.CreateDirectory(storagePath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(storagePath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Cập nhật Database
            var relativeUrl = $"/api/User/avatar/{fileName}";
            user.AvatarUrl = relativeUrl;
            await _context.SaveChangesAsync();

            var httpRequest = _httpContextAccessor.HttpContext!.Request;
            var baseUrl = $"{httpRequest.Scheme}://{httpRequest.Host}";
            var url = $"{baseUrl}{relativeUrl}";
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("banner")]
    public async Task<IActionResult> UploadBanner([FromForm] FileUploadRequest request)
    {
        var file = request.File;
        if (file == null || file.Length == 0) return BadRequest("Tệp không hợp lệ.");
        
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId)) return Unauthorized();

        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Người dùng không tồn tại." });

            // Lưu vào thư mục storage/banners
            var storagePath = Path.Combine(_env.ContentRootPath, "storage", "banners");
            Directory.CreateDirectory(storagePath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(storagePath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Cập nhật Database
            var relativeUrl = $"/api/User/banner/{fileName}";
            user.BannerUrl = relativeUrl;
            await _context.SaveChangesAsync();

            var httpRequest = _httpContextAccessor.HttpContext!.Request;
            var baseUrl = $"{httpRequest.Scheme}://{httpRequest.Host}";
            var url = $"{baseUrl}{relativeUrl}";
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("banner/{fileName}")]
    public IActionResult GetBanner(string fileName)
    {
        var filePath = Path.Combine(_env.ContentRootPath, "storage", "banners", fileName);
        if (!System.IO.File.Exists(filePath)) return NotFound();

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var contentType = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };
        return PhysicalFile(filePath, contentType);
    }

    [AllowAnonymous]
    [HttpGet("avatar/{fileName}")]
    public IActionResult GetAvatar(string fileName)
    {
        var filePath = Path.Combine(_env.ContentRootPath, "storage", "avatars", fileName);
        if (!System.IO.File.Exists(filePath)) return NotFound();

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var contentType = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };

        return PhysicalFile(filePath, contentType);
    }

    // Endpoint CẬP NHẬT hồ sơ (Sửa lỗi 404 của bạn)
    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfile command)
    {
        // Tìm UserId từ nhiều nguồn Claim để đảm bảo tương thích mọi loại Token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." });

        command.UserId = userId;
        await _mediator.Send(command);

        return Ok(new { message = "Cập nhật hồ sơ thành công!" });
    }

    // Endpoint lấy danh sách bài hát được chia sẻ với người dùng hiện tại
    [Authorize]
    [HttpGet("shared-with-me")]
    public async Task<IActionResult> GetSharedWithMe()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub") ?? User.FindFirst("id");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var result = await _mediator.Send(new GetSharedWithMeQuery(userId));
        return Ok(new { data = result });
    }

    // Endpoint để theo dõi một người dùng khác
    [Authorize]
    [HttpPost("{followingId}/follow")]
    public async Task<IActionResult> FollowUser(Guid followingId)
    {
        var followerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (followerIdClaim == null || !Guid.TryParse(followerIdClaim.Value, out var followerId))
            return Unauthorized();

        if (followerId == followingId)
            return BadRequest(new { message = "Bạn không thể tự theo dõi chính mình." });

        var existingFollow = await _context.Follows
            .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.TargetUserId == followingId);

        if (existingFollow != null) // Đã theo dõi rồi
        {
            _context.Follows.Remove(existingFollow);
            await _context.SaveChangesAsync();
            return Ok(new { isFollowing = false, message = "Đã bỏ theo dõi." });
        }
        else // Chưa theo dõi
        {
            var follower = await _context.Users.FindAsync(followerId);
            if (follower == null) return BadRequest("Không tìm thấy người theo dõi.");

            _context.Follows.Add(new Domain.Follow { FollowerId = followerId, TargetUserId = followingId });

            // Tạo thông báo cho người được theo dõi
            var notification = new Domain.Notification
            {
                Id = Guid.NewGuid(),
                UserId = followingId,
                Message = $"{follower.DisplayName ?? follower.Username} đã bắt đầu theo dõi bạn.",
                Type = "follow",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            await _hubContext.Clients.User(followingId.ToString()).SendAsync("ReceiveNotification", notification);
            return Ok(new { isFollowing = true, message = "Đã theo dõi thành công." });
        }
    }

    // NEW: Search for users
    [Authorize]
    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(new List<object>());
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        Guid.TryParse(userIdClaim?.Value, out var currentUserId);

        var users = await _context.Users
            .Where(u => (u.DisplayName.Contains(query) || u.Username.Contains(query)) && u.Id != currentUserId)
            .OrderByDescending(u => u.DisplayName.StartsWith(query)) // Prioritize matches from the start
            .ThenBy(u => u.DisplayName)
            .Take(10)
            .Select(u => new { u.Id, u.Username, u.DisplayName, u.AvatarUrl })
            .ToListAsync();

        return Ok(users);
    }
}
