using System;

namespace TuneVault.Domain;

public class Follow
{
    public Guid FollowerId { get; set; } // Người nhấn theo dõi
    public Guid TargetUserId { get; set; } // Người hoặc nghệ sĩ được theo dõi
    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;

    public User? Follower { get; set; }
    public User? TargetUser { get; set; }
}