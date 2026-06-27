using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Users;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Đăng nhập và nhận JWT token.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<LoginResult>> Login([FromBody] LoginUser request)
    {
        var result = await _mediator.Send(request);
        return Ok(result);
    }

    /// <summary>Đăng ký tài khoản mới.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var userId = await _mediator.Send(new RegisterUser(request.Email, request.Password, request.DisplayName));
        return Ok(new { id = userId, message = "Đăng ký thành công." });
    }
}

public record RegisterRequest(string Email, string Password, string DisplayName, string? Username = null);
