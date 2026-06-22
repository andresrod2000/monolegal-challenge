namespace Monolegal.Shared;

public enum InvoiceStatus
{
    AlDia,
    PrimerRecordatorio,
    SegundoRecordatorio,
    Desactivado
}

public static class InvoiceStatusValues
{
    public const string AlDia = "al_dia";
    public const string PrimerRecordatorio = "primerrecordatorio";
    public const string SegundoRecordatorio = "segundorecordatorio";
    public const string Desactivado = "desactivado";

    public static readonly InvoiceStatus[] ReminderStatuses =
    [
        InvoiceStatus.PrimerRecordatorio,
        InvoiceStatus.SegundoRecordatorio
    ];

    public static readonly InvoiceStatus[] AllStatuses =
    [
        InvoiceStatus.AlDia,
        InvoiceStatus.PrimerRecordatorio,
        InvoiceStatus.SegundoRecordatorio,
        InvoiceStatus.Desactivado
    ];

    public static string ToValue(InvoiceStatus status) => status switch
    {
        InvoiceStatus.AlDia => AlDia,
        InvoiceStatus.PrimerRecordatorio => PrimerRecordatorio,
        InvoiceStatus.SegundoRecordatorio => SegundoRecordatorio,
        InvoiceStatus.Desactivado => Desactivado,
        _ => throw new ArgumentOutOfRangeException(nameof(status))
    };

    public static InvoiceStatus FromValue(string value) => value switch
    {
        AlDia => InvoiceStatus.AlDia,
        PrimerRecordatorio => InvoiceStatus.PrimerRecordatorio,
        SegundoRecordatorio => InvoiceStatus.SegundoRecordatorio,
        Desactivado => InvoiceStatus.Desactivado,
        _ => throw new ArgumentException($"Invalid invoice status: {value}", nameof(value))
    };

    public static bool IsValid(string value) =>
        value is AlDia or PrimerRecordatorio or SegundoRecordatorio or Desactivado;

    public static string GetLabel(InvoiceStatus status) => status switch
    {
        InvoiceStatus.AlDia => "Al día",
        InvoiceStatus.PrimerRecordatorio => "Primer recordatorio",
        InvoiceStatus.SegundoRecordatorio => "Segundo recordatorio",
        InvoiceStatus.Desactivado => "Desactivado",
        _ => throw new ArgumentOutOfRangeException(nameof(status))
    };
}
