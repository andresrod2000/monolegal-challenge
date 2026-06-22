namespace Monolegal.Domain.Ports;

public record EmailMessage(string To, string Subject, string Body);

public interface IEmailProvider
{
    Task SendReminderAsync(EmailMessage message, CancellationToken cancellationToken = default);
}
