namespace TuneVault.Domain;

public class UserFollow
{
    // Composite Primary Key sẽ được cấu hình trong DbContext
    public Guid FollowerId { get; set; }
    public User Follower { get; set; } = null!;

    public Guid FollowingId { get; set; }
    public User Following { get; set; } = null!;

    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
}