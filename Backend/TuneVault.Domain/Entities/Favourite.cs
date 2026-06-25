using System;

namespace TuneVault.Domain;

public class Favorite
{
    public Guid UserId { get; set; }
    public Guid MediaItemId { get; set; }
    public DateTime LikedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public MediaItem? MediaItem { get; set; }
}
