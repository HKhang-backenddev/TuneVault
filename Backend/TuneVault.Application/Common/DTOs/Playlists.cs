using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain;
using TuneVault.Infrastructure;

namespace TuneVault.Application.Playlists;

public record CreatePlaylistCommand(string Title, string? Description, Guid UserId, bool IsPrivate = false, bool IsCollaborative = false) : IRequest<Guid>;

public class CreatePlaylistHandler : IRequestHandler<CreatePlaylistCommand, Guid>
{
    private readonly TuneVaultDbContext _context;

    public CreatePlaylistHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreatePlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = new Playlist
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            UserId = request.UserId,
            IsPrivate = request.IsPrivate,
            IsCollaborative = request.IsCollaborative,
            CreatedAt = DateTime.UtcNow
        };

        _context.Playlists.Add(playlist);
        await _context.SaveChangesAsync(cancellationToken);

        return playlist.Id;
    }
}

public record GetPlaylistsQuery(Guid UserId) : IRequest<List<PlaylistDto>>;

public record PlaylistDto(Guid Id, string Title, string? Description, int TrackCount, DateTime CreatedAt);

public class GetPlaylistsHandler : IRequestHandler<GetPlaylistsQuery, List<PlaylistDto>>
{
    private readonly TuneVaultDbContext _context;

    public GetPlaylistsHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<List<PlaylistDto>> Handle(GetPlaylistsQuery request, CancellationToken cancellationToken)
    {
        var playlists = await _context.Playlists
            .Where(p => p.UserId == request.UserId)
            .Select(p => new PlaylistDto(
                p.Id,
                p.Title,
                p.Description,
                p.PlaylistTracks.Count,
                p.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return playlists;
    }
}

public record AddTrackToPlaylistCommand(Guid PlaylistId, Guid MediaItemId) : IRequest<Unit>;

public class AddTrackToPlaylistHandler : IRequestHandler<AddTrackToPlaylistCommand, Unit>
{
    private readonly TuneVaultDbContext _context;

    public AddTrackToPlaylistHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(AddTrackToPlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = await _context.Playlists.FindAsync(new object[] { request.PlaylistId }, cancellationToken);
        if (playlist == null)
            throw new KeyNotFoundException("Playlist not found");

        var track = await _context.PlaylistTracks
            .FirstOrDefaultAsync(pt => pt.PlaylistId == request.PlaylistId && pt.MediaItemId == request.MediaItemId, cancellationToken);

        if (track != null)
            throw new InvalidOperationException("Track already in playlist");

        var playlistTrack = new PlaylistTrack
        {
            PlaylistId = request.PlaylistId,
            MediaItemId = request.MediaItemId,
            AddedAt = DateTime.UtcNow
        };

        _context.PlaylistTracks.Add(playlistTrack);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public record RemoveTrackFromPlaylistCommand(Guid PlaylistId, Guid MediaItemId) : IRequest<Unit>;

public class RemoveTrackFromPlaylistHandler : IRequestHandler<RemoveTrackFromPlaylistCommand, Unit>
{
    private readonly TuneVaultDbContext _context;

    public RemoveTrackFromPlaylistHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(RemoveTrackFromPlaylistCommand request, CancellationToken cancellationToken)
    {
        var track = await _context.PlaylistTracks
            .FirstOrDefaultAsync(pt => pt.PlaylistId == request.PlaylistId && pt.MediaItemId == request.MediaItemId, cancellationToken);

        if (track != null)
        {
            _context.PlaylistTracks.Remove(track);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}

public record GetPlaylistDetailQuery(Guid PlaylistId) : IRequest<PlaylistDetailDto>;

public record PlaylistDetailDto(Guid Id, string Title, string? Description, List<PlaylistTrackDto> Tracks);

public record PlaylistTrackDto(Guid Id, string Title, string? ArtistName, int DurationInSeconds, string Genre);

public class GetPlaylistDetailHandler : IRequestHandler<GetPlaylistDetailQuery, PlaylistDetailDto>
{
    private readonly TuneVaultDbContext _context;

    public GetPlaylistDetailHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<PlaylistDetailDto> Handle(GetPlaylistDetailQuery request, CancellationToken cancellationToken)
    {
        var playlist = await _context.Playlists
            .Include(p => p.PlaylistTracks)
            .ThenInclude(pt => pt.MediaItem)
            .ThenInclude(m => m.Artist)
            .FirstOrDefaultAsync(p => p.Id == request.PlaylistId, cancellationToken);

        if (playlist == null)
            throw new KeyNotFoundException("Playlist not found");

        var tracks = (playlist.PlaylistTracks ?? new List<PlaylistTrack>())
            .Where(pt => pt != null && pt.MediaItem != null)
            .Select(pt => pt!) 
            .Select(pt => new PlaylistTrackDto(
                pt.MediaItem!.Id,
                pt.MediaItem.Title ?? "Unknown",
                pt.MediaItem.Artist?.Name,
                pt.MediaItem.DurationInSeconds,
                pt.MediaItem.Genre ?? "Unknown"
            ))
            .ToList();

        return new PlaylistDetailDto(playlist.Id, playlist.Title, playlist.Description, tracks);
    }
}
