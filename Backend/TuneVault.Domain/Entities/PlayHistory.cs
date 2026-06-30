using System;

namespace TuneVault.Domain;

public class PlayHistory
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid MediaItemId { get; set; }
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
    public int PlayDurationSeconds { get; set; } = 0;

    public User? User { get; set; }
    public MediaItem? MediaItem { get; set; }
}