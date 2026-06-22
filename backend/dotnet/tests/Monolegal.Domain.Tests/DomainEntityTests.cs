using Monolegal.Domain.Entities;
using Monolegal.Domain.Errors;
using Monolegal.Shared;

namespace Monolegal.Domain.Tests;

public class ClientTests
{
    [Fact]
    public void Create_ValidClient_NormalizesEmail()
    {
        var client = Client.Create(new ClientProps("client-1", "Acme", "Billing@Acme.COM"));
        Assert.Equal("client-1", client.Id);
        Assert.Equal("billing@acme.com", client.Email);
    }

    [Fact]
    public void Create_EmptyId_Throws()
    {
        Assert.Throws<ClientValidationError>(() => Client.Create(new ClientProps("", "Acme", "a@b.com")));
    }

    [Fact]
    public void Create_InvalidEmail_Throws()
    {
        Assert.Throws<ClientValidationError>(() => Client.Create(new ClientProps("id", "Acme", "invalid")));
    }
}

public class InvoiceTests
{
    private static readonly InvoiceProps ValidProps = new(
        "inv-1",
        "client-1",
        "INV-2026-0001",
        "Suscripción SaaS — Marzo 2026",
        150000m,
        new DateTime(2026, 5, 1),
        InvoiceStatus.PrimerRecordatorio);

    [Fact]
    public void Create_ValidInvoice()
    {
        var invoice = Invoice.Create(ValidProps);
        Assert.Equal("inv-1", invoice.Id);
        Assert.Equal(InvoiceStatus.PrimerRecordatorio, invoice.Status);
    }

    [Fact]
    public void Create_EmptyId_Throws()
    {
        Assert.Throws<InvoiceValidationError>(() => Invoice.Create(ValidProps with { Id = "" }));
        Assert.Throws<InvoiceValidationError>(() => Invoice.Create(ValidProps with { Id = "  " }));
    }

    [Fact]
    public void Create_InvalidAmount_Throws()
    {
        Assert.Throws<InvoiceValidationError>(() => Invoice.Create(ValidProps with { Amount = 0 }));
        Assert.Throws<InvoiceValidationError>(() => Invoice.Create(ValidProps with { Amount = -100 }));
    }

    [Fact]
    public void Overdue_OnDueDate_NotOverdue()
    {
        var today = new DateTime(2026, 6, 16);
        var invoice = Invoice.Create(ValidProps with { DueDate = today, Status = InvoiceStatus.AlDia });
        Assert.False(invoice.IsOverdueAt(today));
        Assert.False(invoice.ShouldTransitionToFirstReminder(today));
    }

    [Fact]
    public void Overdue_DayAfterDueDate_Transitions()
    {
        var today = new DateTime(2026, 6, 16);
        var invoice = Invoice.Create(ValidProps with { DueDate = new DateTime(2026, 6, 15), Status = InvoiceStatus.AlDia });
        Assert.True(invoice.IsOverdueAt(today));
        Assert.True(invoice.ShouldTransitionToFirstReminder(today));
        Assert.Equal(InvoiceStatus.PrimerRecordatorio, invoice.GetStatusAfterBecomingOverdue());
    }

    [Fact]
    public void ReminderTransitions()
    {
        var first = Invoice.Create(ValidProps with { Status = InvoiceStatus.PrimerRecordatorio });
        Assert.Equal(InvoiceStatus.SegundoRecordatorio, first.GetNextStatusAfterReminder());

        var second = Invoice.Create(ValidProps with { Status = InvoiceStatus.SegundoRecordatorio });
        Assert.Equal(InvoiceStatus.Desactivado, second.GetNextStatusAfterReminder());

        var alDia = Invoice.Create(ValidProps with { Status = InvoiceStatus.AlDia });
        Assert.Throws<InvoiceTransitionError>(() => alDia.GetNextStatusAfterReminder());
    }

    [Fact]
    public void BuildReminderPayload_FirstReminder()
    {
        var invoice = Invoice.Create(ValidProps with { Status = InvoiceStatus.PrimerRecordatorio });
        var payload = invoice.BuildReminderPayload("Acme Corp");

        Assert.Equal(InvoiceStatus.SegundoRecordatorio, payload.NextStatus);
        Assert.Contains("Recordatorio de pago", payload.Email.Subject);
        Assert.Contains("Acme Corp", payload.Email.Body);
    }

    [Fact]
    public void BuildReminderPayload_SecondReminder()
    {
        var invoice = Invoice.Create(ValidProps with { Status = InvoiceStatus.SegundoRecordatorio });
        var payload = invoice.BuildReminderPayload("Acme Corp");

        Assert.Equal(InvoiceStatus.Desactivado, payload.NextStatus);
        Assert.Contains("Desactivación inminente", payload.Email.Subject);
        Assert.Contains("segundo y último recordatorio", payload.Email.Body);
    }
}
