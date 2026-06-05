using System;

namespace TuneVault.Domain;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MediaItem> UploadedItems { get; set; } = new List<MediaItem>();
    public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
}