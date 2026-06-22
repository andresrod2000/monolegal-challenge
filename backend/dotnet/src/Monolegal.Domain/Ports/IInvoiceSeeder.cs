using Monolegal.Shared;

namespace Monolegal.Domain.Ports;

public record SeedClientInput(string Id, string Name, string Email);

public record SeedInvoiceInput(
    string ClientId,
    string InvoiceNumber,
    string Concept,
    decimal Amount,
    DateTime DueDate,
    InvoiceStatus Status);

public interface IInvoiceSeeder
{
    Task<int> ResetAndSeedAsync(IReadOnlyList<SeedClientInput> clients, IReadOnlyList<SeedInvoiceInput> invoices, CancellationToken cancellationToken = default);
}
