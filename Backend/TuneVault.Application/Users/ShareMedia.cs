using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain;
using TuneVault.Infrastructure;

namespace TuneVault.Application.Users;

public record ShareMediaCommand(Guid SenderId, string ReceiverUsername, Guid? MediaId, Guid? PlaylistId) : IRequest<bool>;

public class ShareMediaValidator : AbstractValidator<ShareMediaCommand>
{
    public ShareMediaValidator()
    {
        RuleFor(x => x.ReceiverUsername).NotEmpty();
        RuleFor(x => x).Must(x => x.MediaId.HasValue || x.PlaylistId.HasValue)
            .WithMessage("Bạn phải chọn ít nhất một bài hát hoặc một playlist để chia sẻ.");
    }
}

public class ShareMediaHandler : IRequestHandler<ShareMediaCommand, bool>
{
    private readonly IDbContextFactory<TuneVaultDbContext> _contextFactory;
    private readonly INotificationService _notificationService;
    private readonly IEmailShareService _emailShareService;

    public ShareMediaHandler(
        IDbContextFactory<TuneVaultDbContext> contextFactory,
        INotificationService notificationService,
        IEmailShareService emailShareService)
    {
        _contextFactory = contextFactory;
        _notificationService = notificationService;
        _emailShareService = emailShareService;
    }

    public async Task<bool> Handle(ShareMediaCommand request, CancellationToken cancellationToken)
    {
        await using var db = await _contextFactory.CreateDbContextAsync(cancellationToken);

        var receiverIdentifier = request.ReceiverUsername.Trim();

        // Tìm người nhận theo username hoặc email
        var receiver = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username == receiverIdentifier || u.Email == receiverIdentifier, cancellationToken);

        if (receiver == null)
        {
            await _notificationService.SendNotificationAsync(
                request.SenderId.ToString(),
                $"Không tìm thấy người dùng '{receiverIdentifier}'.",
                "error",
                cancellationToken);
            return false;
        }

        var sender = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.SenderId, cancellationToken);

        if (sender == null)
        {
            await _notificationService.SendNotificationAsync(
                request.SenderId.ToString(), "Không tìm thấy thông tin người gửi.", "error", cancellationToken);
            return false;
        }

        if (receiver.Id == sender.Id)
        {
            await _notificationService.SendNotificationAsync(
                request.SenderId.ToString(), "Bạn không thể chia sẻ cho chính mình.", "error", cancellationToken);
            return false;
        }

        var senderName = sender.DisplayName ?? sender.Username;

        // Lấy tên bài hát
        string mediaItemTitle = "một nội dung";
        if (request.MediaId.HasValue)
        {
            var mediaItem = await db.MediaItems
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == request.MediaId.Value, cancellationToken);
            if (mediaItem != null)
                mediaItemTitle = $"bài hát '{mediaItem.Title}'";
        }

        // Kiểm tra nếu đã chia sẻ trước đó
        var existingShare = await db.MediaShares
            .AsNoTracking()
            .FirstOrDefaultAsync(s =>
                s.ReceiverId == receiver.Id &&
                s.MediaItemId == request.MediaId &&
                s.PlaylistId == request.PlaylistId, cancellationToken);

        if (existingShare == null)
        {
            var share = new MediaShare
            {
                Id = Guid.NewGuid(),
                SenderId = request.SenderId,
                ReceiverId = receiver.Id,
                MediaItemId = request.MediaId,
                PlaylistId = request.PlaylistId,
                SharedAt = DateTime.UtcNow
            };
            db.MediaShares.Add(share);
        }

        // Tạo thông báo
        var message = $"{senderName} đã chia sẻ {mediaItemTitle} với bạn.";
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = receiver.Id,
            Message = message,
            IsRead = false,
            Type = "Share",
            CreatedAt = DateTime.UtcNow,
            PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                mediaId = request.MediaId?.ToString(),
                playlistId = request.PlaylistId?.ToString(),
                message
            })
        };
        db.Notifications.Add(notification);

        await db.SaveChangesAsync(cancellationToken);

        // Gửi thông báo real-time tới người nhận
        await _notificationService.SendNotificationAsync(
            receiver.Id.ToString(), message, "share", cancellationToken);

        // Gửi email nếu receiverIdentifier là email
        if (IsEmail(receiverIdentifier) && !string.IsNullOrWhiteSpace(receiver.Email))
        {
            var subject = $"{senderName} đã chia sẻ {mediaItemTitle} với bạn";
            string? link = null;
            if (request.MediaId.HasValue)
                link = $"{receiverIdentifier}/song/{request.MediaId.Value}";
            else if (request.PlaylistId.HasValue)
                link = $"{receiverIdentifier}/playlist/{request.PlaylistId.Value}";

            var html = $@"
                <div style='font-family:Arial,sans-serif;line-height:1.5'>
                  <p>Chào bạn,</p>
                  <p><b>{senderName}</b> đã chia sẻ {mediaItemTitle} với bạn.</p>
                  <p><a href='{link ?? receiverIdentifier}'>Xem tại TuneVault</a></p>
                </div>";

            // Email lỗi KHÔNG được làm thất bại share
            // (Share + notification cho người nhận vẫn cần thành công dù SMTP không chạy)
            try
            {
                await _emailShareService.SendShareEmailAsync(receiver.Email, subject, html, cancellationToken);
            }
            catch (Exception ex)
            {
                // Không throw lại để tránh trả 400 cho request share
                // Log để bạn kiểm tra SMTP / cấu hình server.
                Console.WriteLine($"[ShareMedia] Gửi email thất bại: {ex.Message}");
            }
        }

        return true;
    }

    private static bool IsEmail(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        try
        {
            var at = value.IndexOf('@');
            var dot = value.LastIndexOf('.');
            return at > 0 && dot > at + 1 && dot < value.Length - 1;
        }
        catch
        {
            return false;
        }
    }
}
