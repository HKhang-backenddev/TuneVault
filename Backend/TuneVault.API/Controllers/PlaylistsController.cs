using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Playlists;
using TuneVault.Infrastructure;
using TuneVault.Domain;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlaylistsController : BaseApiController
{
    private readonly IMediator _mediator;
    private readonly TuneVaultDbContext _context;

    public PlaylistsController(IMediator mediator, TuneVaultDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    /// <summary>Playlist của tôi.</summary>
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var userId = RequireUserId();
        var playlists = await _mediator.Send(new GetPlaylistsQuery(userId));
        return Ok(playlists);
    }

    /// <summary>Playlist của người dùng khác.</summary>
    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        var playlists = await _mediator.Send(new GetPlaylistsQuery(userId));
        return Ok(playlists);
    }

    /// <summary>Playlist đang follow.</summary>
    [HttpGet("following")]
    public async Task<IActionResult> GetFollowing()
    {
        var userId = RequireUserId();
        var following = await _context.PlaylistFollowers
            .Where(pf => pf.UserId == userId)
            .Include(pf => pf.Playlist)
            .ThenInclude(p => p!.User)
            .Select(pf => new
            {
                id = pf.Playlist!.Id,
                title = pf.Playlist.Title,
                description = pf.Playlist.Description,
                isPrivate = pf.Playlist.IsPrivate,
                isCollaborative = pf.Playlist.IsCollaborative,
                userId = pf.Playlist.UserId,
                ownerName = pf.Playlist.User!.DisplayName ?? pf.Playlist.User.Username,
                trackCount = pf.Playlist.PlaylistTracks.Count,
                followedAt = pf.FollowedAt
            })
            .ToListAsync();
        return Ok(following);
    }

    /// <summary>Chi tiết playlist.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var playlist = await _mediator.Send(new GetPlaylistDetailQuery(id));
        return Ok(playlist);
    }

    /// <summary>Tạo playlist mới.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlaylistRequest request)
    {
        var userId = RequireUserId();
        var id = await _mediator.Send(new CreatePlaylistCommand(request.Title, request.Description, userId, request.IsPrivate, request.IsCollaborative));
        return Ok(new { id, message = "Tạo playlist thành công." });
    }

    /// <summary>Cập nhật playlist.</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePlaylistRequest request)
    {
        var userId = RequireUserId();
        var playlist = await _context.Playlists.FirstOrDefaultAsync(p => p.Id == id);
        if (playlist == null) return NotFound(new { message = "Không tìm thấy playlist." });
        
        // Kiểm tra quyền: chỉ chủ sở hữu hoặc collaborator mới được sửa
        var isOwner = playlist.UserId == userId;
        var isCollaborator = await _context.PlaylistCollaborators.AnyAsync(pc => pc.PlaylistId == id && pc.UserId == userId);
        if (!isOwner && !isCollaborator)
            return Forbid();

        playlist.Title = request.Title ?? playlist.Title;
        playlist.Description = request.Description ?? playlist.Description;
        playlist.IsPrivate = request.IsPrivate;
        playlist.IsCollaborative = request.IsCollaborative;
        playlist.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật playlist thành công." });
    }

    /// <summary>Xóa playlist.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = RequireUserId();
        var playlist = await _context.Playlists.FirstOrDefaultAsync(p => p.Id == id);
        if (playlist == null) return NotFound(new { message = "Không tìm thấy playlist." });
        if (playlist.UserId != userId) return Forbid();

        _context.Playlists.Remove(playlist);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Xóa playlist thành công." });
    }

    /// <summary>Thêm bài hát vào playlist.</summary>
    [HttpPost("{playlistId:guid}/tracks/{mediaItemId:guid}")]
    public async Task<IActionResult> AddTrack(Guid playlistId, Guid mediaItemId)
    {
        var userId = RequireUserId();
        var playlist = await _context.Playlists.FirstOrDefaultAsync(p => p.Id == playlistId);
        if (playlist == null) return NotFound(new { message = "Không tìm thấy playlist." });
        
        // Kiểm tra quyền
        var isOwner = playlist.UserId == userId;
        var isCollaborator = await _context.PlaylistCollaborators.AnyAsync(pc => pc.PlaylistId == playlistId && pc.UserId == userId);
        if (!isOwner && !isCollaborator && !playlist.IsCollaborative)
            return Forbid();

        await _mediator.Send(new AddTrackToPlaylistCommand(playlistId, mediaItemId));
        return Ok(new { message = "Đã thêm bài hát vào playlist." });
    }

    /// <summary>Xóa bài hát khỏi playlist.</summary>
    [HttpDelete("{playlistId:guid}/tracks/{mediaItemId:guid}")]
    public async Task<IActionResult> RemoveTrack(Guid playlistId, Guid mediaItemId)
    {
        var userId = RequireUserId();
        var playlist = await _context.Playlists.FirstOrDefaultAsync(p => p.Id == playlistId);
        if (playlist == null) return NotFound(new { message = "Không tìm thấy playlist." });
        
        var isOwner = playlist.UserId == userId;
        var isCollaborator = await _context.PlaylistCollaborators.AnyAsync(pc => pc.PlaylistId == playlistId && pc.UserId == userId);
        if (!isOwner && !isCollaborator)
            return Forbid();

        await _mediator.Send(new RemoveTrackFromPlaylistCommand(playlistId, mediaItemId));
        return Ok(new { message = "Đã xóa bài hát khỏi playlist." });
    }

    /// <summary>Follow playlist.</summary>
    [HttpPost("{id:guid}/follow")]
    public async Task<IActionResult> Follow(Guid id)
    {
        var userId = RequireUserId();
        var playlist = await _context.Playlists.FindAsync(id);
        if (playlist == null) return NotFound(new { message = "Không tìm thấy playlist." });
        if (playlist.IsPrivate && playlist.UserId != userId) return Forbid();

        var existing = await _context.PlaylistFollowers.FindAsync(id, userId);
        if (existing != null) return Ok(new { isFollowing = true, message = "Đã follow." });

        _context.PlaylistFollowers.Add(new PlaylistFollower { PlaylistId = id, UserId = userId });
        await _context.SaveChangesAsync();
        return Ok(new { isFollowing = true, message = "Đã follow playlist." });
    }

    /// <summary>Unfollow playlist.</summary>
    [HttpDelete("{id:guid}/follow")]
    public async Task<IActionResult> Unfollow(Guid id)
    {
        var userId = RequireUserId();
        var existing = await _context.PlaylistFollowers.FindAsync(id, userId);
        if (existing == null) return Ok(new { isFollowing = false, message = "Chưa follow." });

        _context.PlaylistFollowers.Remove(existing);
        await _context.SaveChangesAsync();
        return Ok(new { isFollowing = false, message = "Đã unfollow playlist." });
    }

    /// <summary>Thêm collaborator vào playlist.</summary>
    [HttpPost("{id:guid}/collaborators/{username}")]
    public async Task<IActionResult> AddCollaborator(Guid id, string username)
    {
        var userId = RequireUserId();
        var playlist = await _context.Playlists.FirstOrDefaultAsync(p => p.Id == id);
        if (playlist == null) return NotFound(new { message = "Không tìm thấy playlist." });
        if (playlist.UserId != userId) return Forbid();

        var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (targetUser == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var existing = await _context.PlaylistCollaborators.FindAsync(id, targetUser.Id);
        if (existing != null) return Ok(new { message = "Đã là collaborator." });

        _context.PlaylistCollaborators.Add(new PlaylistCollaborator { PlaylistId = id, UserId = targetUser.Id });
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Đã thêm @{username} làm collaborator." });
    }

    /// <summary>Xóa collaborator khỏi playlist.</summary>
    [HttpDelete("{id:guid}/collaborators/{username}")]
    public async Task<IActionResult> RemoveCollaborator(Guid id, string username)
    {
        var userId = RequireUserId();
        var playlist = await _context.Playlists.FirstOrDefaultAsync(p => p.Id == id);
        if (playlist == null) return NotFound(new { message = "Không tìm thấy playlist." });
        if (playlist.UserId != userId) return Forbid();

        var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (targetUser == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var existing = await _context.PlaylistCollaborators.FindAsync(id, targetUser.Id);
        if (existing != null)
        {
            _context.PlaylistCollaborators.Remove(existing);
            await _context.SaveChangesAsync();
        }
        return Ok(new { message = $"Đã xóa @{username} khỏi collaborator." });
    }

    /// <summary>Lấy danh sách bình luận bài hát.</summary>
    [HttpGet("/api/media/{id:guid}/comments")]
    public async Task<IActionResult> GetComments(Guid id)
    {
        var comments = await _context.MediaComments
            .Where(c => c.MediaItemId == id)
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                id = c.Id,
                content = c.Content,
                createdAt = c.CreatedAt,
                userId = c.UserId,
                username = c.User!.Username,
                displayName = c.User.DisplayName ?? c.User.Username,
                avatarUrl = c.User.AvatarUrl
            })
            .ToListAsync();
        return Ok(comments);
    }

    /// <summary>Thêm bình luận bài hát.</summary>
    [HttpPost("/api/media/{id:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddCommentRequest request)
    {
        var userId = RequireUserId();
        var media = await _context.MediaItems.FindAsync(id);
        if (media == null) return NotFound(new { message = "Không tìm thấy bài hát." });

        var comment = new MediaComment
        {
            Id = Guid.NewGuid(),
            MediaItemId = id,
            UserId = userId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };
        _context.MediaComments.Add(comment);
        await _context.SaveChangesAsync();
        return Ok(new { id = comment.Id, message = "Đã thêm bình luận." });
    }

    /// <summary>Xóa bình luận.</summary>
    [HttpDelete("/api/comments/{commentId:guid}")]
    public async Task<IActionResult> DeleteComment(Guid commentId)
    {
        var userId = RequireUserId();
        var comment = await _context.MediaComments.FindAsync(commentId);
        if (comment == null) return NotFound(new { message = "Không tìm thấy bình luận." });
        if (comment.UserId != userId) return Forbid();

        _context.MediaComments.Remove(comment);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã xóa bình luận." });
    }
}

public record CreatePlaylistRequest(string Title, string? Description, bool IsPrivate = false, bool IsCollaborative = false);
public record UpdatePlaylistRequest(string? Title, string? Description, bool? IsPrivate, bool? IsCollaborative);
public record AddCommentRequest(string Content);
