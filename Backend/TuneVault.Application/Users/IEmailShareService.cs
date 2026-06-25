using System.Threading;
using System.Threading.Tasks;

namespace TuneVault.Application.Users;

public interface IEmailShareService
{
    Task SendShareEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
}

