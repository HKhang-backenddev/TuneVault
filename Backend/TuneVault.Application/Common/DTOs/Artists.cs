using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Infrastructure;

namespace TuneVault.Application.Artists;

public record GetArtistsQuery(string? Query = null, int Page = 1, int PageSize = 20) : IRequest<GetArtistsResponse>;

public record ArtistDto(Guid Id, string Name, string? Bio, string? ImageUrl, int SongCount);

public record GetArtistsResponse(List<ArtistDto> Artists, int Total, int Page, int PageSize);

public class GetArtistsHandler : IRequestHandler<GetArtistsQuery, GetArtistsResponse>
{
    private readonly TuneVaultDbContext _context;

    public GetArtistsHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<GetArtistsResponse> Handle(GetArtistsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Artists.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Query))
            query = query.Where(a => a.Name.Contains(request.Query));

        var total = await query.CountAsync(cancellationToken);
        var skip = (request.Page - 1) * request.PageSize;

        var artists = await query
            .OrderBy(a => a.Name)
            .Skip(skip)
            .Take(request.PageSize)
            .Select(a => new ArtistDto(
                a.Id,
                a.Name,
                a.Bio,
                a.ImageUrl,
                a.MediaItems.Count
            ))
            .ToListAsync(cancellationToken);

        return new GetArtistsResponse(artists, total, request.Page, request.PageSize);
    }
}

public record GetArtistByIdQuery(Guid ArtistId) : IRequest<ArtistDetailDto>;

public record ArtistDetailDto(Guid Id, string Name, string? Bio, string? ImageUrl, int SongCount);

public class GetArtistByIdHandler : IRequestHandler<GetArtistByIdQuery, ArtistDetailDto>
{
    private readonly TuneVaultDbContext _context;

    public GetArtistByIdHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<ArtistDetailDto> Handle(GetArtistByIdQuery request, CancellationToken cancellationToken)
    {
        var artist = await _context.Artists
            .Include(a => a.MediaItems)
            .FirstOrDefaultAsync(a => a.Id == request.ArtistId, cancellationToken);

        if (artist == null)
            throw new KeyNotFoundException("Artist not found");

        return new ArtistDetailDto(
            artist.Id,
            artist.Name,
            artist.Bio,
            artist.ImageUrl,
            artist.MediaItems.Count
        );
    }
}
