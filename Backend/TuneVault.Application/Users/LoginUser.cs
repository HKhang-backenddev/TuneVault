using BCrypt.Net;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain;
using TuneVault.Infrastructure;

namespace TuneVault.Application.Users;

public record LoginUser(string UsernameOrEmail, string Password) : IRequest<LoginResult>;

public record LoginResult(string Token, Guid UserId, string DisplayName);

public class LoginUserValidator : AbstractValidator<LoginUser>
{
    public LoginUserValidator()
    {
        RuleFor(x => x.UsernameOrEmail).NotEmpty().WithMessage("Tên đăng nhập hoặc email không được để trống.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Mật khẩu không được để trống.");
    }
}

public class LoginUserHandler : IRequestHandler<LoginUser, LoginResult>
{
    private readonly TuneVaultDbContext _context;
    private readonly ITokenService _tokenService;

    public LoginUserHandler(TuneVaultDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<LoginResult> Handle(LoginUser request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Select(u => new User { // Chỉ chọn các trường cần thiết để xác thực
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                PasswordHash = u.PasswordHash,
                DisplayName = u.DisplayName
            })
            .FirstOrDefaultAsync(u => u.Username == request.UsernameOrEmail || u.Email == request.UsernameOrEmail, cancellationToken);

        if (user == null || !global::BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) 
        {
            throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không đúng.");
        }

        var token = _tokenService.GenerateJwtToken(user);

        return new LoginResult(token, user.Id, user.DisplayName ?? user.Username);
    }
}