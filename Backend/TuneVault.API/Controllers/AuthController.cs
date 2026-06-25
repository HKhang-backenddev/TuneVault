using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Users;
using FluentValidation; // Thêm using này

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

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUser command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return Ok(new { userId = result, message = "Đăng ký thành công!" });
        }
        catch (ValidationException vex) // Bắt lỗi Validation cụ thể
        {
            // Trả về lỗi validation theo định dạng chuẩn ProblemDetails
            var errors = vex.Errors.GroupBy(e => e.PropertyName)
                                   .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return BadRequest(new ValidationProblemDetails(errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation Error",
                Detail = "One or more validation errors occurred."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUser command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}