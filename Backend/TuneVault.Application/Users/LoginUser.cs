using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using TuneVault.Infrastructure;

namespace TuneVault.Application.Users;

public record LoginUser(string Email, string Password) : IRequest<LoginResponse>;

public record LoginResponse(Guid UserId, string Username, string Email, string Token);

public class LoginUserValidator : AbstractValidator<LoginUser>
{
    public LoginUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class LoginUserHandler : IRequestHandler<LoginUser, LoginResponse>
{
    private readonly TuneVaultDbContext _context;
    private readonly IValidator<LoginUser> _validator;
    private readonly ITokenService _tokenService;

    public LoginUserHandler(TuneVaultDbContext context, IValidator<LoginUser> validator, ITokenService tokenService)
    {
        _context = context;
        _validator = validator;
        _tokenService = tokenService;
    }

    public async Task<LoginResponse> Handle(LoginUser request, CancellationToken cancellationToken)
    {
        await _validator.ValidateAndThrowAsync(request, cancellationToken);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user == null)
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng!");

        var passwordHash = HashPassword(request.Password);
        if (user.PasswordHash != passwordHash)
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng!");

        var token = _tokenService.GenerateToken(user.Id, user.Email);

        return new LoginResponse(user.Id, user.Username, user.Email, token);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }
}

public interface ITokenService
{
    string GenerateToken(Guid userId, string email);
}
