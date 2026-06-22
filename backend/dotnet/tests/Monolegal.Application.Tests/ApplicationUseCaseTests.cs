using Monolegal.Application;
using Monolegal.Domain.Entities;
using Monolegal.Domain.Errors;
using Monolegal.Domain.Ports;
using Monolegal.Shared;
using Moq;

namespace Monolegal.Application.Tests;

public class ProcessInvoiceRemindersUseCaseTests
{
    private static readonly Client DefaultClient = Client.Create(new ClientProps("client-1", "Acme Corp", "billing@acme.com"));

    private static Invoice CreateInvoice(string id, InvoiceStatus status, string clientId = "client-1") =>
        Invoice.Create(new InvoiceProps(id, clientId, "INV-2026-0001", "Suscripción SaaS", 150000m, new DateTime(2026, 5, 1), status));

    [Fact]
    public async Task Execute_ProcessesFirstReminder()
    {
        var invoice = CreateInvoice("inv-1", InvoiceStatus.PrimerRecordatorio);
        var repo = new Mock<IInvoiceRepository>();
        repo.Setup(r => r.FindByStatusAsync(It.IsAny<IEnumerable<InvoiceStatus>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([invoice]);
        repo.Setup(r => r.UpdateStatusAsync("inv-1", InvoiceStatus.SegundoRecordatorio, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var clientRepo = new Mock<IClientRepository>();
        clientRepo.Setup(r => r.FindByIdAsync("client-1", It.IsAny<CancellationToken>())).ReturnsAsync(DefaultClient);

        var email = new Mock<IEmailProvider>();
        var useCase = new ProcessInvoiceRemindersUseCase(repo.Object, clientRepo.Object, email.Object, new NullLogger());

        var result = await useCase.ExecuteAsync();

        Assert.Equal(1, result.Processed);
        Assert.Equal(0, result.Failed);
        email.Verify(e => e.SendReminderAsync(It.Is<EmailMessage>(m => m.To == "billing@acme.com"), It.IsAny<CancellationToken>()), Times.Once);
        repo.Verify(r => r.UpdateStatusAsync("inv-1", InvoiceStatus.SegundoRecordatorio, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteForInvoiceId_ThrowsWhenNotFound()
    {
        var repo = new Mock<IInvoiceRepository>();
        repo.Setup(r => r.FindByIdAsync("missing", It.IsAny<CancellationToken>())).ReturnsAsync((Invoice?)null);
        var useCase = new ProcessInvoiceRemindersUseCase(repo.Object, Mock.Of<IClientRepository>(), Mock.Of<IEmailProvider>(), new NullLogger());

        await Assert.ThrowsAsync<InvoiceNotFoundError>(() => useCase.ExecuteForInvoiceIdAsync("missing"));
    }

    [Fact]
    public async Task ExecuteForInvoiceId_ThrowsWhenNotEligible()
    {
        var invoice = CreateInvoice("inv-al-dia", InvoiceStatus.AlDia);
        var repo = new Mock<IInvoiceRepository>();
        repo.Setup(r => r.FindByIdAsync("inv-al-dia", It.IsAny<CancellationToken>())).ReturnsAsync(invoice);
        var useCase = new ProcessInvoiceRemindersUseCase(repo.Object, Mock.Of<IClientRepository>(), Mock.Of<IEmailProvider>(), new NullLogger());

        await Assert.ThrowsAsync<InvoiceTransitionError>(() => useCase.ExecuteForInvoiceIdAsync("inv-al-dia"));
    }
}

public class ProcessOverdueInvoicesUseCaseTests
{
    private static readonly DateTime Today = new(2026, 6, 16);

    private static Invoice CreateInvoice(string id, InvoiceStatus status, DateTime dueDate) =>
        Invoice.Create(new InvoiceProps(id, "client-1", "INV-2026-0001", "Suscripción SaaS", 150000m, dueDate, status));

    [Fact]
    public async Task Execute_TransitionsOverdueInvoice()
    {
        var invoice = CreateInvoice("inv-1", InvoiceStatus.AlDia, new DateTime(2026, 6, 15));
        var repo = new Mock<IInvoiceRepository>();
        repo.Setup(r => r.FindByStatusAndDueDateBeforeAsync(InvoiceStatus.AlDia, It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([invoice]);

        var useCase = new ProcessOverdueInvoicesUseCase(repo.Object, new NullLogger());
        var result = await useCase.ExecuteAsync(Today);

        Assert.Equal(1, result.Transitioned);
        repo.Verify(r => r.UpdateStatusAsync("inv-1", InvoiceStatus.PrimerRecordatorio, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Execute_DoesNotTransitionDueToday()
    {
        var invoice = CreateInvoice("inv-1", InvoiceStatus.AlDia, Today);
        var repo = new Mock<IInvoiceRepository>();
        repo.Setup(r => r.FindByStatusAndDueDateBeforeAsync(InvoiceStatus.AlDia, It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([invoice]);

        var useCase = new ProcessOverdueInvoicesUseCase(repo.Object, new NullLogger());
        var result = await useCase.ExecuteAsync(Today);

        Assert.Equal(0, result.Transitioned);
        repo.Verify(r => r.UpdateStatusAsync(It.IsAny<string>(), It.IsAny<InvoiceStatus>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

public class CreateClientUseCaseTests
{
    [Fact]
    public async Task Execute_CreatesClient()
    {
        var repo = new Mock<IClientRepository>();
        repo.Setup(r => r.CreateAsync(It.IsAny<ClientProps>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ClientProps p, CancellationToken _) => Client.Create(p));

        var useCase = new CreateClientUseCase(repo.Object, new NullLogger());
        var client = await useCase.ExecuteAsync(new CreateClientInput("client-1", "Acme", "billing@acme.com"));

        Assert.Equal("client-1", client.Id);
    }
}

internal sealed class NullLogger : ILogger
{
    public void Debug(string message, IReadOnlyDictionary<string, object?>? context = null) { }
    public void Info(string message, IReadOnlyDictionary<string, object?>? context = null) { }
    public void Warn(string message, IReadOnlyDictionary<string, object?>? context = null) { }
    public void Error(string message, IReadOnlyDictionary<string, object?>? context = null) { }
    public ILogger Child(IReadOnlyDictionary<string, object?> context) => this;
}
