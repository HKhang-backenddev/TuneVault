using System;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain;

namespace TuneVault.Infrastructure;

public class TuneVaultDbContext : DbContext
{
    public TuneVaultDbContext(DbContextOptions<TuneVaultDbContext> options) : base(options)
    {
    }

    // Ánh xạ 10 bảng CSDL vào Code C#
    public DbSet<User> Users => Set<User>();
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();
    public DbSet<Artist> Artists => Set<Artist>();
    public DbSet<Playlist> Playlists => Set<Playlist>();
    public DbSet<PlaylistTrack> PlaylistTracks => Set<PlaylistTrack>();
    public DbSet<MediaShare> MediaShares => Set<MediaShare>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<PlayHistory> PlayHistories => Set<PlayHistory>();
    public DbSet<Follow> Follows => Set<Follow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Cấu hình khóa chính phức hợp cho các bảng trung gian trùng khớp với SQL script
        modelBuilder.Entity<PlaylistTrack>().HasKey(pt => new { pt.PlaylistId, pt.MediaItemId });
        modelBuilder.Entity<Favorite>().HasKey(f => new { f.UserId, f.MediaItemId });
        modelBuilder.Entity<Follow>().HasKey(f => new { f.FollowerId, f.TargetUserId });

        // Cấu hình các mối quan hệ và tránh lỗi loop cascade dính chùm
        modelBuilder.Entity<MediaShare>()
            .HasOne(ms => ms.Sender).WithMany().HasForeignKey(ms => ms.SenderId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MediaShare>()
            .HasOne(ms => ms.Receiver).WithMany().HasForeignKey(ms => ms.ReceiverId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MediaItem>()
            .HasOne(m => m.Owner).WithMany(u => u.UploadedItems).HasForeignKey(m => m.OwnerId).OnDelete(DeleteBehavior.Restrict);
    }
}