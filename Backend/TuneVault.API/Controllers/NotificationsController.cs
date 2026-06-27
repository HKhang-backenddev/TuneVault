using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuneVault.Infrastructure;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : BaseApiController
{
    private readonly TuneVaultDbContext _context;

    public NotificationsController(TuneVaultDbContext context)
    {
        _context = context;
    }

    /// <summary>Danh sách thông báo của tôi.</summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = RequireUserId();
        var items = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                id = n.Id,
                type = n.Type,
                message = n.Message,
                isRead = n.IsRead,
                createdAt = n.CreatedAt,
                payloadJson = n.PayloadJson
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>Đánh dấu thông báo đã đọc.</summary>
    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = RequireUserId();
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null)
            return NotFound(new { message = "Không tìm thấy thông báo." });

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã đánh dấu đã đọc." });
    }

    /// <summary>Xóa thông báo.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = RequireUserId();
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null)
            return NotFound(new { message = "Không tìm thấy thông báo." });

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã xóa thông báo." });
    }
}
