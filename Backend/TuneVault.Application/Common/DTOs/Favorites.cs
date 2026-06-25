using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain;
using TuneVault.Infrastructure;
using TuneVault.Application.Users; // Thêm using này để dùng INotificationService

namespace TuneVault.Application.Media;

public record ToggleFavoriteCommand(Guid UserId, Guid MediaItemId) : IRequest<bool>;

public class ToggleFavoriteHandler : IRequestHandler<ToggleFavoriteCommand, bool>
{
    private readonly TuneVaultDbContext _context;
    private readonly INotificationService _notificationService; // Inject INotificationService

    public ToggleFavoriteHandler(TuneVaultDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(ToggleFavoriteCommand request, CancellationToken cancellationToken)
    {
        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == request.UserId && f.MediaItemId == request.MediaItemId, cancellationToken);

        if (favorite != null)
        {
            // Nếu đã thích rồi thì xóa đi (Bỏ thích)
            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync(cancellationToken);
            await _notificationService.SendNotificationAsync(request.UserId.ToString(), "Đã bỏ thích bài hát.", "info", cancellationToken);
            return false;
        }
        else
        {
            // Nếu chưa thích thì thêm mới
            _context.Favorites.Add(new Favorite
            {
                UserId = request.UserId,
                MediaItemId = request.MediaItemId,
                LikedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync(cancellationToken);
            await _notificationService.SendNotificationAsync(request.UserId.ToString(), "Đã thêm vào bài hát yêu thích.", "success", cancellationToken);
            return true;
        }
    }
}