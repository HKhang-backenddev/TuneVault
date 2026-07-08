using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Infrastructure;

namespace TuneVault.Application.Media;

public record GetSongsQuery(string? Query = null, int Page = 1, int PageSize = 20) : IRequest<GetSongsResponse>;

public record SongDto(Guid Id, string Title, string? ArtistName, int DurationInSeconds, string Genre, 
    string? ThumbnailUrl, DateTime CreatedAt, string MediaUrl);

public record GetSongsResponse(List<SongDto> Songs, int Total, int Page, int PageSize);

public class GetSongsHandler : IRequestHandler<GetSongsQuery, GetSongsResponse>
{
    private readonly TuneVaultDbContext _context;

    public GetSongsHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<GetSongsResponse> Handle(GetSongsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.MediaItems.Include(m => m.Artist).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Query))
            query = query.Where(m => m.Title.Contains(request.Query!) || (m.Artist != null && m.Artist.Name.Contains(request.Query!)));

        var total = await query.CountAsync(cancellationToken);
        var skip = (request.Page - 1) * request.PageSize;

        var songs = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip(skip)
            .Take(request.PageSize)
            .Select(m => new SongDto(
                m.Id,
                m.Title,
                m.Artist != null ? m.Artist.Name : null,
                m.DurationInSeconds,
                m.Genre,
                m.ThumbnailUrl,
                m.CreatedAt,
                $"/api/media/stream/{m.Id}"
            ))
            .ToListAsync(cancellationToken);

        return new GetSongsResponse(songs, total, request.Page, request.PageSize);
    }
}

public record GetSongByIdQuery(Guid SongId) : IRequest<SongDetailDto>;

public record SongDetailDto(Guid Id, string Title, string? Description, string? ArtistName, Guid? ArtistId, 
    int DurationInSeconds, string Genre, string? ThumbnailUrl, string MediaUrl, DateTime CreatedAt);

public class GetSongByIdHandler : IRequestHandler<GetSongByIdQuery, SongDetailDto>
{
    private readonly TuneVaultDbContext _context;

    public GetSongByIdHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<SongDetailDto> Handle(GetSongByIdQuery request, CancellationToken cancellationToken)
    {
        var song = await _context.MediaItems.Include(m => m.Artist)
            .FirstOrDefaultAsync(m => m.Id == request.SongId, cancellationToken);

        if (song == null)
            throw new KeyNotFoundException("Song not found");

        return new SongDetailDto(
            song.Id,
            song.Title,
            song.Description,
            song.Artist?.Name,
            song.Artist?.Id,
            song.DurationInSeconds,
            song.Genre,
            song.ThumbnailUrl,
            $"/api/media/stream/{song.Id}",
            song.CreatedAt
        );
    }
}

public record GetArtistSongsQuery(Guid ArtistId, int Page = 1, int PageSize = 20) : IRequest<GetSongsResponse>;

public class GetArtistSongsHandler : IRequestHandler<GetArtistSongsQuery, GetSongsResponse>
{
    private readonly TuneVaultDbContext _context;

    public GetArtistSongsHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<GetSongsResponse> Handle(GetArtistSongsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.MediaItems
            .Where(m => m.ArtistId == request.ArtistId)
            .Include(m => m.Artist);

        var total = await query.CountAsync(cancellationToken);
        var skip = (request.Page - 1) * request.PageSize;

        var songs = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip(skip)
            .Take(request.PageSize)
            .Select(m => new SongDto(
                m.Id,
                m.Title,
                m.Artist != null ? m.Artist.Name : null,
                m.DurationInSeconds,
                m.Genre,
                m.ThumbnailUrl,
                m.CreatedAt,
                $"/api/media/stream/{m.Id}"
            ))
            .ToListAsync(cancellationToken);

        return new GetSongsResponse(songs, total, request.Page, request.PageSize);
    }
}
