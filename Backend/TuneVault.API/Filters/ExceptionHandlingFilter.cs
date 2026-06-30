using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace TuneVault.API.Filters;

public class ExceptionHandlingFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        context.Result = context.Exception switch
        {
            ValidationException validation => new BadRequestObjectResult(new
            {
                message = "Dữ liệu không hợp lệ.",
                errors = validation.Errors.Select(e => e.ErrorMessage)
            }),
            UnauthorizedAccessException unauthorized => new UnauthorizedObjectResult(new { message = unauthorized.Message }),
            KeyNotFoundException notFound => new NotFoundObjectResult(new { message = notFound.Message }),
            InvalidOperationException invalid => new BadRequestObjectResult(new { message = invalid.Message }),
            DbUpdateException dbUpdate => new BadRequestObjectResult(new
            {
                message = $"DbUpdateException: {dbUpdate.InnerException?.Message ?? dbUpdate.Message}"
            }),
            _ => new ObjectResult(new { message = context.Exception.Message })
            {
                StatusCode = StatusCodes.Status500InternalServerError
            }
        };
        context.ExceptionHandled = true;
    }
}
