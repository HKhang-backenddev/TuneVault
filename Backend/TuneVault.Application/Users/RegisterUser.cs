using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using TuneVault.Domain;
using TuneVault.Infrastructure;

namespace TuneVault.Application.Users;

// 1. Command: Dữ liệu đầu vào từ phía Client gửi lên
public record RegisterUser(string Username, string Email, string Password, string DisplayName) : IRequest<Guid>;

// 2. Validator: Kiểm tra tính hợp lệ dữ liệu đầu vào (Yêu cầu bắt buộc của FluentValidation trong đề bài)
public class RegisterUserValidator : AbstractValidator<RegisterUser>
{
    public RegisterUserValidator()
    {
        RuleFor(x => x.Username).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(150);
    }
}

// 3. Handler: Đoạn code thực thi nghiệp vụ lưu User vào SQL Server
public class RegisterUserHandler : IRequestHandler<RegisterUser, Guid>
{
    private readonly TuneVaultDbContext _context;
    private readonly IValidator<RegisterUser> _validator;

    public RegisterUserHandler(TuneVaultDbContext context, IValidator<RegisterUser> validator)
    {
        _context = context;
        _validator = validator;
    }

    public async Task<Guid> Handle(RegisterUser request, CancellationToken cancellationToken)
    {
        await _validator.ValidateAndThrowAsync(request, cancellationToken);

        var userExists = await _context.Users.AnyAsync(u => u.Email == request.Email || u.Username == request.Username, cancellationToken);
        if (userExists) throw new InvalidOperationException("Email hoặc username đã được đăng ký sử dụng!");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            DisplayName = request.DisplayName,
            CreatedAt = DateTime.UtcNow
        };

        // Lưu vào CSDL SQL Server của bạn
        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return user.Id;
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }
}