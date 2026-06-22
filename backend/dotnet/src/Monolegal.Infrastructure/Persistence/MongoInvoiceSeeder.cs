using Monolegal.Domain.Ports;
using MongoDB.Driver;

namespace Monolegal.Infrastructure.Persistence;

public class MongoInvoiceSeeder(IMongoDatabase database) : IInvoiceSeeder
{
    public async Task<int> ResetAndSeedAsync(
        IReadOnlyList<SeedClientInput> clients,
        IReadOnlyList<SeedInvoiceInput> invoices,
        CancellationToken cancellationToken = default)
    {
        var clientCollection = database.GetCollection<ClientDocument>("clients");
        var invoiceCollection = database.GetCollection<InvoiceDocument>("invoices");

        await invoiceCollection.DeleteManyAsync(FilterDefinition<InvoiceDocument>.Empty, cancellationToken);
        await clientCollection.DeleteManyAsync(FilterDefinition<ClientDocument>.Empty, cancellationToken);

        if (clients.Count > 0)
        {
            var now = DateTime.UtcNow;
            var clientDocs = clients.Select(c => new ClientDocument
            {
                ClientId = c.Id,
                Name = c.Name,
                Email = c.Email,
                CreatedAt = now,
                UpdatedAt = now
            }).ToList();
            await clientCollection.InsertManyAsync(clientDocs, cancellationToken: cancellationToken);
        }

        if (invoices.Count > 0)
        {
            var now = DateTime.UtcNow;
            var invoiceDocs = invoices.Select(i => new InvoiceDocument
            {
                ClientId = i.ClientId,
                InvoiceNumber = i.InvoiceNumber,
                Concept = i.Concept,
                Amount = i.Amount,
                DueDate = i.DueDate,
                Status = Shared.InvoiceStatusValues.ToValue(i.Status),
                CreatedAt = now,
                UpdatedAt = now
            }).ToList();
            await invoiceCollection.InsertManyAsync(invoiceDocs, cancellationToken: cancellationToken);
        }

        return invoices.Count;
    }
}
