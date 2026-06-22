using System.Text.Json.Serialization;
using Monolegal.Domain.Entities;
using Monolegal.Shared;

namespace Monolegal.Api.Dtos;

public record ClientDto(string Id, string Name, string Email);

public record CreateClientBody(string Id, string Name, string Email);

public record UpdateClientBody(string? Name, string? Email);

public record InvoiceSummaryDto(
    string Id,
    string ClientId,
    string ClientName,
    string ClientEmail,
    string InvoiceNumber,
    string Concept,
    decimal Amount,
    string DueDate,
    [property: JsonConverter(typeof(InvoiceStatusJsonConverter))] InvoiceStatus Status);

public record InvoiceDetailDto(
    string Id,
    string ClientId,
    string InvoiceNumber,
    string Concept,
    decimal Amount,
    string DueDate,
    [property: JsonConverter(typeof(InvoiceStatusJsonConverter))] InvoiceStatus Status);

public record CreateInvoiceBody(
    string ClientId,
    string Concept,
    decimal Amount,
    string DueDate,
    [property: JsonConverter(typeof(InvoiceStatusJsonConverter))] InvoiceStatus Status);

public record UpdateInvoiceBody(
    string? Concept,
    decimal? Amount,
    string? DueDate,
    [property: JsonConverter(typeof(InvoiceStatusJsonConverter))] InvoiceStatus? Status);

public record CollectionResponse<T>(IReadOnlyList<T> Data, MetaResponse Meta);

public record ResourceResponse<T>(T Data);

public record MetaResponse(int Total);

public record ErrorResponse(ErrorBody Error);

public record ErrorBody(string Message);

public record HealthResponse(string Status, string Service, string Timestamp);

public record ProcessOverdueResponse(int Transitioned, int Failed);

public record ProcessRemindersResponse(int Processed, int Failed);

public static class Mappers
{
    public static ClientDto ToDto(Client client) => new(client.Id, client.Name, client.Email);

    public static InvoiceSummaryDto ToSummaryDto(InvoiceSummary invoice) => new(
        invoice.Id,
        invoice.ClientId,
        invoice.ClientName,
        invoice.ClientEmail,
        invoice.InvoiceNumber,
        invoice.Concept,
        invoice.Amount,
        invoice.DueDate.ToUniversalTime().ToString("O"),
        invoice.Status);

    public static InvoiceDetailDto ToDetailDto(Invoice invoice) => new(
        invoice.Id,
        invoice.ClientId,
        invoice.InvoiceNumber,
        invoice.Concept,
        invoice.Amount,
        invoice.DueDate.ToUniversalTime().ToString("O"),
        invoice.Status);
}

public class InvoiceStatusJsonConverter : JsonConverter<InvoiceStatus>
{
    public override InvoiceStatus Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options) =>
        InvoiceStatusValues.FromValue(reader.GetString() ?? string.Empty);

    public override void Write(System.Text.Json.Utf8JsonWriter writer, InvoiceStatus value, System.Text.Json.JsonSerializerOptions options) =>
        writer.WriteStringValue(InvoiceStatusValues.ToValue(value));
}

public class NullableInvoiceStatusJsonConverter : JsonConverter<InvoiceStatus?>
{
    public override InvoiceStatus? Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return value is null ? null : InvoiceStatusValues.FromValue(value);
    }

    public override void Write(System.Text.Json.Utf8JsonWriter writer, InvoiceStatus? value, System.Text.Json.JsonSerializerOptions options)
    {
        if (value is null) writer.WriteNullValue();
        else writer.WriteStringValue(InvoiceStatusValues.ToValue(value.Value));
    }
}
