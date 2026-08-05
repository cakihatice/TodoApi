using Microsoft.Extensions.Logging;
using TodoApi.Domain.Interfaces;

namespace TodoApi.Infrastructure.Email;

// Gerçek mail göndermez; sadece log'a yazar.
// İleride gerçek SMTP/SendGrid implementasyonuyla değiştirilecek.
public class LoggingEmailSender : IEmailSender
{
    private readonly ILogger<LoggingEmailSender> _logger;

    public LoggingEmailSender(ILogger<LoggingEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        _logger.LogInformation(
            "📧 [SAHTE MAIL] Kime: {To} | Konu: {Subject}\n{Body}",
            toEmail, subject, htmlBody);
        return Task.CompletedTask;
    }
}