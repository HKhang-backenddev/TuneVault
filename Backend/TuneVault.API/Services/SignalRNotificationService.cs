using Microsoft.AspNetCore.SignalR;
using TuneVault.Application.Users;
using TuneVault.API.Hubs;

namespace TuneVault.API.Services;

public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationAsync(string userId, string message, string type = "info", CancellationToken ct = default)
    {
        // Gửi thông báo đến user cụ thể dựa trên UserId (khớp với Claim NameIdentifier trong JWT)
        await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", new 
        { 
            type = type, 
            message = message, 
            refresh = true // Cờ quan trọng để Frontend tự F5 dữ liệu
        }, ct);
    }
}