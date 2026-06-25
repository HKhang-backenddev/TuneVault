using System;
using System.Collections.Generic;

namespace TuneVault.Domain;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? BannerUrl { get; set; }
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime? LastUpdatedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Mối quan hệ Theo dõi
    public ICollection<UserFollow> Followers { get; set; } = new List<UserFollow>(); // Những người theo dõi user này
    public ICollection<UserFollow> Following { get; set; } = new List<UserFollow>(); // Những người mà user này theo dõi

    public ICollection<MediaItem> UploadedItems { get; set; } = new List<MediaItem>();
    public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
}