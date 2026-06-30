using System;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain;

namespace TuneVault.Infrastructure;

public class TuneVaultDbContext : DbContext
{
    public TuneVaultDbContext(DbContextOptions<TuneVaultDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();
    public DbSet<Artist> Artists => Set<Artist>();
    public DbSet<Album> Albums => Set<Album>();
    public DbSet<UserFollow> UserFollows { get; set; } = null!;
    public DbSet<Playlist> Playlists => Set<Playlist>();
    public DbSet<PlaylistTrack> PlaylistTracks => Set<PlaylistTrack>();
    public DbSet<MediaShare> MediaShares => Set<MediaShare>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<PlayHistory> PlayHistories => Set<PlayHistory>();
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<PlaylistFollower> PlaylistFollowers => Set<PlaylistFollower>();
    public DbSet<PlaylistCollaborator> PlaylistCollaborators => Set<PlaylistCollaborator>();
    public DbSet<MediaComment> MediaComments => Set<MediaComment>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Cấu hình khóa chính phức hợp cho các bảng trung gian trùng khớp với SQL script
        modelBuilder.Entity<PlaylistTrack>().HasKey(pt => new { pt.PlaylistId, pt.MediaItemId });
        modelBuilder.Entity<Favorite>().HasKey(f => new { f.UserId, f.MediaItemId });
        modelBuilder.Entity<Follow>().HasKey(f => new { f.FollowerId, f.TargetUserId });
        modelBuilder.Entity<PlaylistFollower>().HasKey(pf => new { pf.PlaylistId, pf.UserId });
        modelBuilder.Entity<PlaylistCollaborator>().HasKey(pc => new { pc.PlaylistId, pc.UserId });

        // Cấu hình các mối quan hệ và tránh lỗi loop cascade dính chùm
        modelBuilder.Entity<MediaShare>()
            .HasOne(ms => ms.Sender).WithMany().HasForeignKey(ms => ms.SenderId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MediaShare>()
            .HasOne(ms => ms.Receiver).WithMany().HasForeignKey(ms => ms.ReceiverId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MediaShare>()
            .HasOne(ms => ms.MediaItem).WithMany().HasForeignKey(ms => ms.MediaItemId).OnDelete(DeleteBehavior.SetNull);
            
        // Cấu hình cho UserFollow
        modelBuilder.Entity<UserFollow>()
            .HasKey(uf => new { uf.FollowerId, uf.FollowingId });

        modelBuilder.Entity<UserFollow>()
            .HasOne(uf => uf.Follower)
            .WithMany(u => u.Following) // Một người có thể "Following" nhiều người khác
            .HasForeignKey(uf => uf.FollowerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserFollow>()
            .HasOne(uf => uf.Following)
            .WithMany(u => u.Followers) // Một người có thể có nhiều "Followers"
            .HasForeignKey(uf => uf.FollowingId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<MediaItem>()
            .HasOne(m => m.Album).WithMany(a => a.MediaItems).HasForeignKey(m => m.AlbumId).OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<MediaItem>()
            .HasOne(m => m.Owner).WithMany(u => u.UploadedItems).HasForeignKey(m => m.OwnerId).OnDelete(DeleteBehavior.Restrict);

        // Cấu hình cho PlaylistFollower
        modelBuilder.Entity<PlaylistFollower>()
            .HasOne(pf => pf.Playlist)
            .WithMany(p => p.Followers)
            .HasForeignKey(pf => pf.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PlaylistFollower>()
            .HasOne(pf => pf.User)
            .WithMany()
            .HasForeignKey(pf => pf.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Cấu hình cho PlaylistCollaborator
        modelBuilder.Entity<PlaylistCollaborator>()
            .HasOne(pc => pc.Playlist)
            .WithMany(p => p.Collaborators)
            .HasForeignKey(pc => pc.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PlaylistCollaborator>()
            .HasOne(pc => pc.User)
            .WithMany()
            .HasForeignKey(pc => pc.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cấu hình cho MediaComment
        modelBuilder.Entity<MediaComment>()
            .HasOne(c => c.MediaItem)
            .WithMany()
            .HasForeignKey(c => c.MediaItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MediaComment>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Cấu hình cho PlayHistory
        modelBuilder.Entity<PlayHistory>()
            .HasOne(ph => ph.MediaItem)
            .WithMany()
            .HasForeignKey(ph => ph.MediaItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PlayHistory>()
            .HasOne(ph => ph.User)
            .WithMany()
            .HasForeignKey(ph => ph.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed Data B2
        var userId = new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108");
        modelBuilder.Entity<User>().HasData(new User 
        { 
            Id = userId, 
            Username = "admin", 
            Email = "admin@tunevault.com", 
            PasswordHash = "8C6976E5B5410415BDE908BD4DEE15DFB167A9C873FC4BB8A81F6F2AB448A918", // admin123
            DisplayName = "Administrator",
            CreatedAt = new DateTime(2026, 6, 5, 0, 0, 0, DateTimeKind.Utc)
        });

        var artistId = new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00");
        modelBuilder.Entity<Artist>().HasData(new Artist 
        { 
            Id = artistId, 
            Name = "V-Pop Legends",
            CreatedAt = new DateTime(2026, 6, 5, 0, 0, 0, DateTimeKind.Utc)
        });

        for (int i = 1; i <= 10; i++)
        {
            modelBuilder.Entity<MediaItem>().HasData(new MediaItem
            {
                Id = Guid.Parse($"00000000-0000-0000-0000-0000000000{i:D2}"),
                Title = $"Sample Track {i}",
                ArtistId = artistId,
                Genre = i % 2 == 0 ? "Pop" : "Indie",
                FilePath = $"sample_{i}.mp3",
                DurationInSeconds = 180,
                ThumbnailUrl = $"https://picsum.photos/seed/track{i}/300/300",
                OwnerId = userId,
                CreatedAt = new DateTime(2026, 6, 5, 0, 0, 0, DateTimeKind.Utc).AddMinutes(-i)
            });
        }
    }
}