using System;

namespace TuneVault.Domain;

public class MediaShare
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public Guid? MediaItemId { get; set; }
    public Guid? PlaylistId { get; set; }
    public DateTime SharedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? Sender { get; set; }
    public User? Receiver { get; set; }
    public MediaItem? MediaItem { get; set; }
}