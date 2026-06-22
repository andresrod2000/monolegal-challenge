using Monolegal.Domain.Entities;
using Monolegal.Domain.Errors;
using Monolegal.Domain.Ports;
using Monolegal.Shared;

namespace Monolegal.Application;

public record ProcessInvoiceRemindersResult(int Processed, int Failed);

public class ProcessInvoiceRemindersUseCase(
    IInvoiceRepository invoiceRepository,
    IClientRepository clientRepository,
    IEmailProvider emailProvider,
    ILogger logger)
{
    public async Task<ProcessInvoiceRemindersResult> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        var invoices = await invoiceRepository.FindByStatusAsync(InvoiceStatusValues.ReminderStatuses, cancellationToken);

        logger.Info("Starting invoice reminder processing", new Dictionary<string, object?>
        {
            ["totalInvoices"] = invoices.Count
        });

        var processed = 0;
        var failed = 0;

        foreach (var invoice in invoices)
        {
            try
            {
                await ProcessInvoiceAsync(invoice, cancellationToken);
                processed++;
            }
            catch (Exception ex)
            {
                failed++;
                logger.Error("Failed to process invoice reminder", new Dictionary<string, object?>
                {
                    ["invoiceId"] = invoice.Id,
                    ["clientId"] = invoice.ClientId,
                    ["status"] = InvoiceStatusValues.ToValue(invoice.Status),
                    ["error"] = ex.Message
                });
            }
        }

        logger.Info("Invoice reminder processing completed", new Dictionary<string, object?>
        {
            ["processed"] = processed,
            ["failed"] = failed
        });

        return new ProcessInvoiceRemindersResult(processed, failed);
    }

    public async Task<ProcessInvoiceRemindersResult> ExecuteForInvoiceIdAsync(string invoiceId, CancellationToken cancellationToken = default)
    {
        var invoice = await invoiceRepository.FindByIdAsync(invoiceId, cancellationToken);
        if (invoice is null)
            throw new InvoiceNotFoundError($"Invoice not found: {invoiceId}");

        if (!InvoiceStatusValues.ReminderStatuses.Contains(invoice.Status))
            throw new InvoiceTransitionError(
                $"Invoice {invoiceId} is not eligible for reminder processing (status: {InvoiceStatusValues.ToValue(invoice.Status)})");

        logger.Info("Starting single invoice reminder processing", new Dictionary<string, object?> { ["invoiceId"] = invoiceId });

        try
        {
            await ProcessInvoiceAsync(invoice, cancellationToken);
            logger.Info("Single invoice reminder processing completed", new Dictionary<string, object?>
            {
                ["invoiceId"] = invoiceId,
                ["processed"] = 1
            });
            return new ProcessInvoiceRemindersResult(1, 0);
        }
        catch (Exception ex)
        {
            logger.Error("Failed to process invoice reminder", new Dictionary<string, object?>
            {
                ["invoiceId"] = invoiceId,
                ["clientId"] = invoice.ClientId,
                ["status"] = InvoiceStatusValues.ToValue(invoice.Status),
                ["error"] = ex.Message
            });
            return new ProcessInvoiceRemindersResult(0, 1);
        }
    }

    private async Task ProcessInvoiceAsync(Invoice invoice, CancellationToken cancellationToken)
    {
        var client = await clientRepository.FindByIdAsync(invoice.ClientId, cancellationToken);
        if (client is null)
            throw new ClientNotFoundError($"Client not found for invoice {invoice.Id}: {invoice.ClientId}");

        var payload = invoice.BuildReminderPayload(client.Name);

        await emailProvider.SendReminderAsync(
            new EmailMessage(client.Email, payload.Email.Subject, payload.Email.Body),
            cancellationToken);

        try
        {
            await invoiceRepository.UpdateStatusAsync(invoice.Id, payload.NextStatus, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.Warn("Email sent but status update failed", new Dictionary<string, object?>
            {
                ["invoiceId"] = invoice.Id,
                ["clientId"] = invoice.ClientId,
                ["previousStatus"] = InvoiceStatusValues.ToValue(invoice.Status),
                ["targetStatus"] = InvoiceStatusValues.ToValue(payload.NextStatus),
                ["emailAlreadySent"] = true,
                ["error"] = ex.Message
            });
            throw;
        }

        logger.Info("Invoice reminder sent and status updated", new Dictionary<string, object?>
        {
            ["invoiceId"] = invoice.Id,
            ["clientId"] = invoice.ClientId,
            ["clientEmail"] = client.Email,
            ["previousStatus"] = InvoiceStatusValues.ToValue(invoice.Status),
            ["newStatus"] = InvoiceStatusValues.ToValue(payload.NextStatus)
        });
    }
}
