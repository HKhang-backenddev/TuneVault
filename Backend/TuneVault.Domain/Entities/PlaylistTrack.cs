using System;

namespace TuneVault.Domain;

public class PlaylistTrack
{
    public Guid PlaylistId { get; set; }
    public Playlist? Playlist { get; set; }

    public Guid MediaItemId { get; set; }
    public MediaItem? MediaItem { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}