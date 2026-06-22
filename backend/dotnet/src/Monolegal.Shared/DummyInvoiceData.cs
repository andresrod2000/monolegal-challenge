namespace Monolegal.Shared;

public static class DummyInvoiceData
{
    public const int DateMinDaysOffset = -2;
    public const int DateMaxDaysOffset = 7;

    private static readonly string[] ConceptTemplates =
    [
        "Suscripción SaaS",
        "Soporte técnico",
        "Consultoría integración API",
        "Implementación módulo facturación",
        "Capacitación usuarios",
        "Mantenimiento mensual",
        "Licencias anuales",
        "Desarrollo personalizado reportes",
        "Migración de datos históricos",
        "Auditoría de cumplimiento"
    ];

    private static readonly string[] MonthsEs =
    [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    public static DateTime StartOfDay(DateTime date) =>
        date.Date;

    public static int DiffDaysFromToday(DateTime dueDate, DateTime? today = null)
    {
        var due = StartOfDay(dueDate);
        var reference = StartOfDay(today ?? DateTime.Now);
        return (int)Math.Round((due - reference).TotalDays);
    }

    public static int RandomInt(int min, int max) =>
        Random.Shared.Next(min, max + 1);

    public static DateTime AddDays(DateTime date, int days) =>
        StartOfDay(date.AddDays(days));

    public static DateTime RandomDueDateFromToday(int minDaysAhead = 0, int maxDaysAhead = DateMaxDaysOffset, DateTime? today = null)
    {
        var reference = StartOfDay(today ?? DateTime.Now);
        return AddDays(reference, RandomInt(minDaysAhead, maxDaysAhead));
    }

    public static DateTime RandomDueDateFromTwoDaysAgo(int maxDaysAhead = DateMaxDaysOffset, DateTime? today = null)
    {
        var reference = StartOfDay(today ?? DateTime.Now);
        return AddDays(reference, RandomInt(DateMinDaysOffset, maxDaysAhead));
    }

    public static string GenerateRandomConcept()
    {
        var template = ConceptTemplates[RandomInt(0, ConceptTemplates.Length - 1)];
        var month = MonthsEs[RandomInt(0, MonthsEs.Length - 1)];
        var year = DateTime.Now.Year + RandomInt(0, 1);
        return $"{template} — {month} {year}";
    }

    public static decimal GenerateRandomAmount()
    {
        var steps = RandomInt(5, 90);
        return steps * 10_000m;
    }

    public record DummyInvoiceFields(string Concept, decimal Amount, DateTime DueDate);

    public static DummyInvoiceFields GenerateDummyInvoiceFields(string mode, int? maxDaysAhead = null, DateTime? today = null)
    {
        var dueDate = mode == "seed"
            ? RandomDueDateFromTwoDaysAgo(maxDaysAhead ?? DateMaxDaysOffset, today)
            : RandomDueDateFromToday(0, maxDaysAhead ?? DateMaxDaysOffset, today);

        return new DummyInvoiceFields(
            GenerateRandomConcept(),
            GenerateRandomAmount(),
            dueDate);
    }

    public static InvoiceStatus DeriveStatusFromDueDate(DateTime dueDate, DateTime? today = null)
    {
        var diffDays = DiffDaysFromToday(dueDate, today);

        if (diffDays >= 0) return InvoiceStatus.AlDia;
        if (diffDays >= -7) return InvoiceStatus.PrimerRecordatorio;
        if (diffDays >= -21) return InvoiceStatus.SegundoRecordatorio;
        return InvoiceStatus.Desactivado;
    }
}
