using Monolegal.Shared;

namespace Monolegal.Domain.Entities;

public record InvoiceProps(
    string Id,
    string ClientId,
    string InvoiceNumber,
    string Concept,
    decimal Amount,
    DateTime DueDate,
    InvoiceStatus Status);

public record InvoiceSummary(
    string Id,
    string ClientId,
    string ClientName,
    string ClientEmail,
    string InvoiceNumber,
    string Concept,
    decimal Amount,
    DateTime DueDate,
    InvoiceStatus Status);

public record InvoiceUpdateProps(
    string? Concept = null,
    decimal? Amount = null,
    DateTime? DueDate = null,
    InvoiceStatus? Status = null);

public record ReminderEmail(string Subject, string Body);

public record ReminderPayload(ReminderEmail Email, InvoiceStatus NextStatus);

public class Invoice
{
    public string Id { get; }
    public string ClientId { get; }
    public string InvoiceNumber { get; }
    public string Concept { get; }
    public decimal Amount { get; }
    public DateTime DueDate { get; }
    public InvoiceStatus Status { get; }

    private Invoice(InvoiceProps props)
    {
        Id = props.Id;
        ClientId = props.ClientId;
        InvoiceNumber = props.InvoiceNumber;
        Concept = props.Concept;
        Amount = props.Amount;
        DueDate = props.DueDate;
        Status = props.Status;
    }

    public static Invoice Create(InvoiceProps props)
    {
        if (string.IsNullOrWhiteSpace(props.Id))
            throw new Errors.InvoiceValidationError("Invoice id is required");
        if (string.IsNullOrWhiteSpace(props.ClientId))
            throw new Errors.InvoiceValidationError("Invoice clientId is required");
        if (string.IsNullOrWhiteSpace(props.InvoiceNumber))
            throw new Errors.InvoiceValidationError("Invoice invoiceNumber is required");
        if (string.IsNullOrWhiteSpace(props.Concept))
            throw new Errors.InvoiceValidationError("Invoice concept is required");
        if (props.Amount <= 0)
            throw new Errors.InvoiceValidationError("Invoice amount must be greater than zero");
        if (!InvoiceStatusValues.AllStatuses.Contains(props.Status))
            throw new Errors.InvoiceValidationError($"Invalid invoice status: {props.Status}");

        return new Invoice(props);
    }

    public static Invoice FromProps(InvoiceProps props) => Create(props);

    public InvoiceProps ToProps() => new(Id, ClientId, InvoiceNumber, Concept, Amount, DueDate, Status);

    public bool IsOverdueAt(DateTime referenceDate) =>
        DummyInvoiceData.DiffDaysFromToday(DueDate, referenceDate) < 0;

    public bool ShouldTransitionToFirstReminder(DateTime referenceDate) =>
        Status == InvoiceStatus.AlDia && IsOverdueAt(referenceDate);

    public InvoiceStatus GetStatusAfterBecomingOverdue() => InvoiceStatus.PrimerRecordatorio;

    public bool CanSendFirstReminder() => Status == InvoiceStatus.PrimerRecordatorio;

    public bool CanSendSecondReminder() => Status == InvoiceStatus.SegundoRecordatorio;

    public InvoiceStatus GetNextStatusAfterReminder()
    {
        if (CanSendFirstReminder()) return InvoiceStatus.SegundoRecordatorio;
        if (CanSendSecondReminder()) return InvoiceStatus.Desactivado;
        throw new Errors.InvoiceTransitionError($"Invoice {Id} is not eligible for reminder processing");
    }

    public ReminderPayload BuildReminderPayload(string clientName)
    {
        var nextStatus = GetNextStatusAfterReminder();
        var email = CanSendFirstReminder()
            ? BuildFirstReminderEmail(clientName)
            : BuildSecondReminderEmail(clientName);
        return new ReminderPayload(email, nextStatus);
    }

    private ReminderEmail BuildFirstReminderEmail(string clientName) => new(
        $"Recordatorio de pago — {InvoiceNumber} — {clientName}",
        string.Join('\n', new[]
        {
            $"Estimado/a {clientName},",
            "",
            $"Le informamos que su factura {InvoiceNumber} ({Concept}) por ${FormatAmount()} con vencimiento el {FormatDueDate()} se encuentra pendiente de pago.",
            "",
            "Este es su primer recordatorio. Si no realiza el pago, recibirá un segundo aviso y posteriormente su servicio será desactivado.",
            "",
            "Atentamente,",
            "Equipo Monolegal"
        }));

    private ReminderEmail BuildSecondReminderEmail(string clientName) => new(
        $"Último aviso — Desactivación inminente — {InvoiceNumber} — {clientName}",
        string.Join('\n', new[]
        {
            $"Estimado/a {clientName},",
            "",
            $"Su factura {InvoiceNumber} ({Concept}) por ${FormatAmount()} con vencimiento el {FormatDueDate()} continúa impaga.",
            "",
            "Este es su segundo y último recordatorio. De no recibir el pago, su servicio será desactivado.",
            "",
            "Atentamente,",
            "Equipo Monolegal"
        }));

    private string FormatAmount() => Amount.ToString("N0", new System.Globalization.CultureInfo("es-CO"));

    private string FormatDueDate() => DueDate.ToString("d", new System.Globalization.CultureInfo("es-CO"));
}
