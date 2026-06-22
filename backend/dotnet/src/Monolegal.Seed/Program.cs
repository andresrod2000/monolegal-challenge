using Microsoft.Extensions.DependencyInjection;
using Monolegal.Domain.Ports;
using Monolegal.Infrastructure;
using Monolegal.Infrastructure.Persistence;
using Monolegal.Shared;

var settings = DependencyInjection.LoadSettingsFromEnvironment("seed");

var services = new ServiceCollection();
services.AddMonolegalInfrastructure(settings);
var provider = services.BuildServiceProvider();

try
{
    var seeder = provider.GetRequiredService<IInvoiceSeeder>();
    var logger = provider.GetRequiredService<ILogger>();

    var clients = new List<SeedClientInput>
    {
        new("client-acme", "Acme Corp", "billing@acme.com"),
        new("client-legaltech", "LegalTech SA", "finanzas@legaltech.co"),
        new("client-consultores", "Consultores XYZ", "pagos@consultoresxyz.com")
    };

    const int invoiceCount = 15;
    var year = DateTime.Now.Year;
    var invoices = Enumerable.Range(0, invoiceCount).Select(index =>
    {
        var fields = DummyInvoiceData.GenerateDummyInvoiceFields("seed");
        var client = clients[DummyInvoiceData.RandomInt(0, clients.Count - 1)];
        return new SeedInvoiceInput(
            client.Id,
            $"INV-{year}-{(index + 1):D4}",
            fields.Concept,
            fields.Amount,
            fields.DueDate,
            DummyInvoiceData.DeriveStatusFromDueDate(fields.DueDate));
    }).ToList();

    var inserted = await seeder.ResetAndSeedAsync(clients, invoices);
    var statusCounts = invoices
        .GroupBy(i => InvoiceStatusValues.ToValue(i.Status))
        .ToDictionary(g => g.Key, g => g.Count());

    logger.Info("Seed completed", new Dictionary<string, object?>
    {
        ["clients"] = clients.Count,
        ["invoices"] = inserted,
        ["statusDistribution"] = statusCounts
    });
}
catch (Exception ex)
{
    Console.Error.WriteLine($"Seed failed: {ex.Message}");
    Environment.ExitCode = 1;
}
finally
{
    await MongoDbConnection.DisconnectAsync();
}
