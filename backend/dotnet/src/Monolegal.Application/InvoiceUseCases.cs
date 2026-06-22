using Monolegal.Domain.Entities;
using Monolegal.Domain.Errors;
using Monolegal.Domain.Ports;
using InvoicePropsWithoutId = Monolegal.Domain.Ports.InvoicePropsWithoutId;
using Monolegal.Shared;

namespace Monolegal.Application;

public record CreateInvoiceInput(
    string ClientId,
    string Concept,
    decimal Amount,
    DateTime DueDate,
    InvoiceStatus Status);

public class CreateInvoiceUseCase(
    IInvoiceRepository invoiceRepository,
    IClientRepository clientRepository,
    ILogger logger)
{
    public async Task<Invoice> ExecuteAsync(CreateInvoiceInput input, CancellationToken cancellationToken = default)
    {
        if (!await clientRepository.ExistsAsync(input.ClientId, cancellationToken))
            throw new ClientNotFoundError($"Client not found: {input.ClientId}");

        var year = input.DueDate.Year;
        var count = await invoiceRepository.CountByYearAsync(year, cancellationToken);
        var invoiceNumber = $"INV-{year}-{(count + 1):D4}";

        var invoice = await invoiceRepository.CreateAsync(
            new InvoicePropsWithoutId(input.ClientId, invoiceNumber, input.Concept, input.Amount, input.DueDate, input.Status),
            cancellationToken);

        Invoice.Create(invoice.ToProps());
        logger.Info("Invoice created", new Dictionary<string, object?>
        {
            ["invoiceId"] = invoice.Id,
            ["invoiceNumber"] = invoice.InvoiceNumber,
            ["clientId"] = input.ClientId
        });
        return invoice;
    }
}

public class UpdateInvoiceUseCase(IInvoiceRepository invoiceRepository, ILogger logger)
{
    public async Task<Invoice> ExecuteAsync(string id, InvoiceUpdateProps input, CancellationToken cancellationToken = default)
    {
        var existing = await invoiceRepository.FindByIdAsync(id, cancellationToken);
        if (existing is null)
            throw new InvoiceNotFoundError($"Invoice not found: {id}");

        var merged = existing.ToProps() with
        {
            Concept = input.Concept ?? existing.Concept,
            Amount = input.Amount ?? existing.Amount,
            DueDate = input.DueDate ?? existing.DueDate,
            Status = input.Status ?? existing.Status
        };
        Invoice.Create(merged);

        var invoice = await invoiceRepository.UpdateAsync(id, input, cancellationToken);
        logger.Info("Invoice updated", new Dictionary<string, object?> { ["invoiceId"] = id });
        return invoice;
    }
}

public class DeleteInvoiceUseCase(IInvoiceRepository invoiceRepository, ILogger logger)
{
    public async Task ExecuteAsync(string id, CancellationToken cancellationToken = default)
    {
        var existing = await invoiceRepository.FindByIdAsync(id, cancellationToken);
        if (existing is null)
            throw new InvoiceNotFoundError($"Invoice not found: {id}");

        await invoiceRepository.DeleteAsync(id, cancellationToken);
        logger.Info("Invoice deleted", new Dictionary<string, object?> { ["invoiceId"] = id });
    }
}

public class GetInvoiceByIdUseCase(IInvoiceRepository invoiceRepository, ILogger logger)
{
    public async Task<Invoice> ExecuteAsync(string id, CancellationToken cancellationToken = default)
    {
        var invoice = await invoiceRepository.FindByIdAsync(id, cancellationToken);
        if (invoice is null)
            throw new InvoiceNotFoundError($"Invoice not found: {id}");
        return invoice;
    }
}

public class GetInvoicesSummaryUseCase(IInvoiceRepository invoiceRepository, ILogger logger)
{
    public async Task<IReadOnlyList<InvoiceSummary>> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        var summaries = await invoiceRepository.FindAllSummariesAsync(cancellationToken);
        logger.Debug("Invoices summary listed", new Dictionary<string, object?> { ["count"] = summaries.Count });
        return summaries;
    }
}
