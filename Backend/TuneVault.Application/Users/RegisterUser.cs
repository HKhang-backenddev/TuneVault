using BCrypt.Net;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain;
using TuneVault.Infrastructure;

namespace TuneVault.Application.Users; 

public record RegisterUser(string Email, string Password, string DisplayName) : IRequest<Guid>; // Đã đúng, không cần thay đổi

public class RegisterUserValidator : AbstractValidator<RegisterUser>
{
    private readonly TuneVaultDbContext _context;

    public RegisterUserValidator(TuneVaultDbContext context)
    {
        _context = context;

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống.")
            .EmailAddress().WithMessage("Email không hợp lệ.")
            .MustAsync(BeUniqueEmail).WithMessage("Email đã tồn tại.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống.")
            .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự.")
            .Matches("[A-Z]").WithMessage("Mật khẩu phải chứa ít nhất một chữ hoa.")
            .Matches("[a-z]").WithMessage("Mật khẩu phải chứa ít nhất một chữ thường.")
            .Matches("[0-9]").WithMessage("Mật khẩu phải chứa ít nhất một chữ số.");

        RuleFor(x => x.DisplayName)
            .NotEmpty().WithMessage("Tên hiển thị không được để trống.")
            .MinimumLength(3).WithMessage("Tên hiển thị phải có ít nhất 3 ký tự.");
    }

    private async Task<bool> BeUniqueEmail(string email, CancellationToken cancellationToken)
    {
        return await _context.Users.AllAsync(u => u.Email != email, cancellationToken);
    }
}

public class RegisterUserHandler : IRequestHandler<RegisterUser, Guid>
{
    private readonly TuneVaultDbContext _context;

    public RegisterUserHandler(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(RegisterUser request, CancellationToken cancellationToken)
    {
        // Check if email already exists (should be caught by validator, but good to double check)
        if (await _context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken))
        {
            throw new InvalidOperationException("Email đã tồn tại.");
        }

        // Tự động tạo username duy nhất từ email để đảm bảo tính nhất quán
        var usernameBase = request.Email.Split('@')[0].ToLower().Replace(".", "").Replace("_", "");
        var finalUsername = usernameBase;
        int counter = 1;
        while (await _context.Users.AnyAsync(u => u.Username == finalUsername, cancellationToken))
        {
            finalUsername = $"{usernameBase}{counter++}";
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = finalUsername, // Sử dụng username đã được tạo tự động
            Email = request.Email,
            PasswordHash = global::BCrypt.Net.BCrypt.HashPassword(request.Password), 
            DisplayName = request.DisplayName,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return user.Id;
    }
}