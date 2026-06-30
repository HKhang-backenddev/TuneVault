using System;

namespace TuneVault.Domain;

public class Playlist
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPrivate { get; set; } = false;
    public bool IsCollaborative { get; set; } = false;
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public User? User { get; set; }
    public ICollection<PlaylistTrack> PlaylistTracks { get; set; } = new List<PlaylistTrack>();
    public ICollection<PlaylistFollower> Followers { get; set; } = new List<PlaylistFollower>();
    public ICollection<PlaylistCollaborator> Collaborators { get; set; } = new List<PlaylistCollaborator>();
}

// Người theo dõi playlist
public class PlaylistFollower
{
    public Guid Id { get; set; }
    public Guid PlaylistId { get; set; }
    public Guid UserId { get; set; }
    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
    public Playlist? Playlist { get; set; }
    public User? User { get; set; }
}

// Người cùng chỉnh sửa playlist (collaborative)
public class PlaylistCollaborator
{
    public Guid Id { get; set; }
    public Guid PlaylistId { get; set; }
    public Guid UserId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    public Playlist? Playlist { get; set; }
    public User? User { get; set; }
}

// Bình luận bài hát
public class MediaComment
{
    public Guid Id { get; set; }
    public Guid MediaItemId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public MediaItem? MediaItem { get; set; }
    public User? User { get; set; }
}

// Lịch sử nghe nhạc
public class PlayHistory
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid MediaItemId { get; set; }
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
    public int PlayDurationSeconds { get; set; } = 0;
    public MediaItem? MediaItem { get; set; }
    public User? User { get; set; }
}