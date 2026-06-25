using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Infrastructure;

namespace TuneVault.Application.Users;

// 1. Command: Định nghĩa dữ liệu gửi từ Frontend lên
public record UpdateUserProfile : IRequest
{
    public Guid UserId { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Location { get; set; }
    public string? BannerUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
}

// 2. Handler: Logic xử lý cập nhật vào Database
public class UpdateUserProfileHandler : IRequestHandler<UpdateUserProfile>
{
    private readonly TuneVaultDbContext _context;

    public UpdateUserProfileHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateUserProfile request, CancellationToken cancellationToken)
    {
        // Tìm user trong DB dựa trên UserId lấy từ Token
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException("Không tìm thấy người dùng để cập nhật.");
        }

        // Cập nhật Username nếu có và không trùng
        if (!string.IsNullOrWhiteSpace(request.Username) && user.Username != request.Username.Trim())
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username, cancellationToken))
                throw new InvalidOperationException("Tên đăng nhập này đã được sử dụng.");
            user.Username = request.Username.Trim();
        }

        // Cập nhật Email nếu có và không trùng
        if (!string.IsNullOrWhiteSpace(request.Email) && user.Email != request.Email.Trim())
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken))
                throw new InvalidOperationException("Email này đã được sử dụng.");
            user.Email = request.Email.Trim();
        }

        // Cập nhật tất cả các trường được gửi từ client.
        // Điều này cho phép client gửi chuỗi rỗng để xóa một giá trị.
        user.DisplayName = request.DisplayName?.Trim();
        user.Bio = request.Bio?.Trim();
        user.AvatarUrl = request.AvatarUrl?.Trim();
        user.Location = request.Location?.Trim();
        user.BannerUrl = request.BannerUrl?.Trim();
        user.WebsiteUrl = request.WebsiteUrl?.Trim();
        user.TwitterUrl = request.TwitterUrl?.Trim();
        user.GithubUrl = request.GithubUrl?.Trim();
        user.Gender = request.Gender?.Trim();
        
        // Chỉ cập nhật ngày sinh nếu nó được cung cấp, vì nó là kiểu DateTime?
        // không thể gán trực tiếp từ một chuỗi rỗng.
        // Frontend đã xử lý việc gửi null nếu ngày sinh trống.
        user.DateOfBirth = request.DateOfBirth;

        // Cập nhật dấu thời gian
        user.LastUpdatedAt = DateTime.UtcNow;

        // Lưu thay đổi xuống SQL Server
        await _context.SaveChangesAsync(cancellationToken);
    }
}