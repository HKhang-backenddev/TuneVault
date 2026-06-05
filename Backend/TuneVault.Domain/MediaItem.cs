using System;

namespace TuneVault.Domain;

public class MediaItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; } 
    public MediaType Type { get; set; }
    public int DurationInSeconds { get; set; }
    public string FilePath { get; set; } = string.Empty; 
    public string? ThumbnailUrl { get; set; }
    public string Genre { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public Guid? ArtistId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? Owner { get; set; }
    public Artist? Artist { get; set; }
    public ICollection<PlaylistTrack> PlaylistTracks { get; set; } = new List<PlaylistTrack>();
}