using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Infrastructure;

namespace TuneVault.Application.Users;

/// <summary>
/// Query để lấy danh sách các media đã được chia sẻ cho người dùng hiện tại.
/// </summary>
public record GetSharedWithMeQuery(Guid UserId) : IRequest<List<SharedMediaDto>>;

/// <summary>
/// DTO chứa thông tin của một media được chia sẻ.
/// </summary>
public record SharedMediaDto(
    Guid MediaId,
    string Title,
    string? ArtistName,
    string SenderName,
    DateTime SharedAt,
    string? ThumbnailUrl,
    string MediaUrl
);

public class GetSharedWithMeHandler : IRequestHandler<GetSharedWithMeQuery, List<SharedMediaDto>>
{
    private readonly TuneVaultDbContext _context;

    public GetSharedWithMeHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<List<SharedMediaDto>> Handle(GetSharedWithMeQuery request, CancellationToken cancellationToken)
    {
        return await _context.MediaShares
            .Where(s => s.ReceiverId == request.UserId && s.MediaItem != null)
            .OrderByDescending(s => s.SharedAt)
            .Select(s => new SharedMediaDto(
                s.MediaItem!.Id,
                s.MediaItem!.Title,
                s.MediaItem!.Artist != null ? s.MediaItem.Artist.Name : "Nghệ sĩ không xác định",
                s.Sender!.DisplayName ?? "Một người dùng",
                s.SharedAt,
                s.MediaItem.ThumbnailUrl,
                $"/media/{s.MediaItem.FilePath}"
            )).ToListAsync(cancellationToken);
    }
}