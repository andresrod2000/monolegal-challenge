using Monolegal.Domain.Errors;
using Monolegal.Domain.Ports;

namespace Monolegal.Application;

public class DeleteClientUseCase(
    IClientRepository clientRepository,
    IInvoiceRepository invoiceRepository,
    ILogger logger)
{
    public async Task ExecuteAsync(string id, CancellationToken cancellationToken = default)
    {
        var existing = await clientRepository.FindByIdAsync(id, cancellationToken);
        if (existing is null)
            throw new ClientNotFoundError($"Client not found: {id}");

        var invoices = await invoiceRepository.FindByClientIdAsync(id, cancellationToken);
        if (invoices.Count > 0)
            throw new ClientHasInvoicesError($"Cannot delete client {id}: {invoices.Count} invoice(s) exist");

        await clientRepository.DeleteAsync(id, cancellationToken);
        logger.Info("Client deleted", new Dictionary<string, object?> { ["clientId"] = id });
    }
}
