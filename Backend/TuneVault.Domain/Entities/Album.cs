using System;
using System.Collections.Generic;

namespace TuneVault.Domain;

public class Album
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid ArtistId { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime ReleaseDate { get; set; } = DateTime.UtcNow;

    public Artist? Artist { get; set; }
    public ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}