using Monolegal.Domain.Ports;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Monolegal.Infrastructure.Email;

public class MockEmailProvider(ILogger logger) : IEmailProvider
{
    public Task SendReminderAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        var preview = message.Body.Length > 100 ? message.Body[..100] : message.Body;
        logger.Info("Mock email sent", new Dictionary<string, object?>
        {
            ["to"] = message.To,
            ["subject"] = message.Subject,
            ["bodyPreview"] = preview
        });
        return Task.CompletedTask;
    }
}

public class GmailEmailProvider(string user, string appPassword, ILogger logger) : IEmailProvider
{
    public async Task SendReminderAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        var mime = new MimeMessage();
        mime.From.Add(new MailboxAddress("Monolegal Facturación", user));
        mime.To.Add(MailboxAddress.Parse(message.To));
        mime.Subject = message.Subject;
        mime.Body = new TextPart("plain") { Text = message.Body };

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls, cancellationToken);
        await client.AuthenticateAsync(user, appPassword, cancellationToken);
        var response = await client.SendAsync(mime, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);

        logger.Info("Email sent via Gmail SMTP", new Dictionary<string, object?>
        {
            ["to"] = message.To,
            ["subject"] = message.Subject,
            ["messageId"] = response
        });
    }
}
