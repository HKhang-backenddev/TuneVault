using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Configuration;
using TuneVault.Application.Users; // Thêm using này

namespace TuneVault.API.Services;

public class EmailShareService : IEmailShareService
{
    private readonly IConfiguration _config;

    public EmailShareService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendShareEmailAsync(
        string toEmail,
        string subject,
        string htmlBody,
        CancellationToken ct = default)
    {
        var smtpHost = _config["Email:SmtpHost"];
        var smtpPortStr = _config["Email:SmtpPort"];
        var smtpUser = _config["Email:User"];
        var smtpPassword = _config["Email:Password"];
        var from = _config["Email:From"];

        if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(smtpPortStr) || string.IsNullOrWhiteSpace(from))
            throw new InvalidOperationException("Email SMTP settings are not configured (Email:SmtpHost/Port/From)." );

        if (!int.TryParse(smtpPortStr, out var smtpPort)) smtpPort = 587;

        using var message = new MailMessage
        {
            From = new MailAddress(from),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };

        message.To.Add(toEmail);

        using var smtp = new SmtpClient(smtpHost, smtpPort)
        {
            EnableSsl = true,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false
        };

        if (!string.IsNullOrWhiteSpace(smtpUser))
            smtp.Credentials = new NetworkCredential(smtpUser, smtpPassword);

        // SmtpClient doesn't support true async for all providers; wrap in Task.Run
        await Task.Run(() => smtp.Send(message), ct);
    }
}
