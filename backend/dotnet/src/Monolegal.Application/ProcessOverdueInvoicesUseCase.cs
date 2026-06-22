using Monolegal.Domain.Entities;
using Monolegal.Domain.Ports;
using Monolegal.Shared;

namespace Monolegal.Application;

public record ProcessOverdueInvoicesResult(int Transitioned, int Failed);

public class ProcessOverdueInvoicesUseCase(IInvoiceRepository invoiceRepository, ILogger logger)
{
    public async Task<ProcessOverdueInvoicesResult> ExecuteAsync(DateTime? referenceDate = null, CancellationToken cancellationToken = default)
    {
        var reference = referenceDate ?? DateTime.Now;
        var dueDateBefore = DummyInvoiceData.StartOfDay(reference);
        var invoices = await invoiceRepository.FindByStatusAndDueDateBeforeAsync(
            InvoiceStatus.AlDia, dueDateBefore, cancellationToken);

        logger.Info("Starting overdue invoice processing", new Dictionary<string, object?>
        {
            ["totalInvoices"] = invoices.Count,
            ["referenceDate"] = dueDateBefore.ToString("O")
        });

        var transitioned = 0;
        var failed = 0;

        foreach (var invoice in invoices)
        {
            try
            {
                var didTransition = await ProcessInvoiceAsync(invoice, reference, cancellationToken);
                if (didTransition)
                    transitioned++;
            }
            catch (Exception ex)
            {
                failed++;
                logger.Error("Failed to transition overdue invoice", new Dictionary<string, object?>
                {
                    ["invoiceId"] = invoice.Id,
                    ["clientId"] = invoice.ClientId,
                    ["status"] = InvoiceStatusValues.ToValue(invoice.Status),
                    ["dueDate"] = invoice.DueDate.ToString("O"),
                    ["error"] = ex.Message
                });
            }
        }

        logger.Info("Overdue invoice processing completed", new Dictionary<string, object?>
        {
            ["transitioned"] = transitioned,
            ["failed"] = failed
        });

        return new ProcessOverdueInvoicesResult(transitioned, failed);
    }

    private async Task<bool> ProcessInvoiceAsync(Invoice invoice, DateTime referenceDate, CancellationToken cancellationToken)
    {
        if (!invoice.ShouldTransitionToFirstReminder(referenceDate))
            return false;

        var nextStatus = invoice.GetStatusAfterBecomingOverdue();
        await invoiceRepository.UpdateStatusAsync(invoice.Id, nextStatus, cancellationToken);

        logger.Info("Overdue invoice transitioned to first reminder", new Dictionary<string, object?>
        {
            ["invoiceId"] = invoice.Id,
            ["clientId"] = invoice.ClientId,
            ["previousStatus"] = InvoiceStatusValues.ToValue(invoice.Status),
            ["newStatus"] = InvoiceStatusValues.ToValue(nextStatus),
            ["dueDate"] = invoice.DueDate.ToString("O")
        });
        return true;
    }
}
