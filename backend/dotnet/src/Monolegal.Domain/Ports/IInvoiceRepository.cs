using Monolegal.Domain.Entities;
using Monolegal.Shared;

namespace Monolegal.Domain.Ports;

public interface IInvoiceRepository
{
    Task<IReadOnlyList<Invoice>> FindByStatusAsync(IEnumerable<InvoiceStatus> statuses, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Invoice>> FindByStatusAndDueDateBeforeAsync(InvoiceStatus status, DateTime dueDateBefore, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InvoiceSummary>> FindAllSummariesAsync(CancellationToken cancellationToken = default);
    Task<Invoice?> FindByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Invoice>> FindByClientIdAsync(string clientId, CancellationToken cancellationToken = default);
    Task<Invoice> CreateAsync(InvoicePropsWithoutId props, CancellationToken cancellationToken = default);
    Task<Invoice> UpdateAsync(string id, InvoiceUpdateProps props, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task UpdateStatusAsync(string id, InvoiceStatus status, CancellationToken cancellationToken = default);
    Task<int> CountByYearAsync(int year, CancellationToken cancellationToken = default);
}

public record InvoicePropsWithoutId(
    string ClientId,
    string InvoiceNumber,
    string Concept,
    decimal Amount,
    DateTime DueDate,
    InvoiceStatus Status);
