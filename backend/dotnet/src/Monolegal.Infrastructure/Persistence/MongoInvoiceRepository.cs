using Monolegal.Domain.Entities;
using Monolegal.Domain.Errors;
using Monolegal.Domain.Ports;
using Monolegal.Shared;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace Monolegal.Infrastructure.Persistence;

[BsonIgnoreExtraElements]
public class InvoiceDocument
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("clientId")]
    public string ClientId { get; set; } = string.Empty;

    [BsonElement("invoiceNumber")]
    public string InvoiceNumber { get; set; } = string.Empty;

    [BsonElement("concept")]
    public string Concept { get; set; } = string.Empty;

    [BsonElement("amount")]
    public decimal Amount { get; set; }

    [BsonElement("dueDate")]
    public DateTime DueDate { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = InvoiceStatusValues.AlDia;

    [BsonElement("createdAt")]
    public DateTime? CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; }
}

public class MongoInvoiceRepository(IMongoDatabase database) : IInvoiceRepository
{
    private readonly IMongoCollection<InvoiceDocument> _collection =
        database.GetCollection<InvoiceDocument>("invoices");

    public async Task<IReadOnlyList<Invoice>> FindByStatusAsync(
        IEnumerable<InvoiceStatus> statuses,
        CancellationToken cancellationToken = default)
    {
        var values = statuses.Select(InvoiceStatusValues.ToValue).ToList();
        var docs = await _collection.Find(d => values.Contains(d.Status)).ToListAsync(cancellationToken);
        return docs.Select(ToDomain).ToList();
    }

    public async Task<IReadOnlyList<Invoice>> FindByStatusAndDueDateBeforeAsync(
        InvoiceStatus status,
        DateTime dueDateBefore,
        CancellationToken cancellationToken = default)
    {
        var statusValue = InvoiceStatusValues.ToValue(status);
        var docs = await _collection
            .Find(d => d.Status == statusValue && d.DueDate < dueDateBefore)
            .ToListAsync(cancellationToken);
        return docs.Select(ToDomain).ToList();
    }

    public async Task<IReadOnlyList<InvoiceSummary>> FindAllSummariesAsync(CancellationToken cancellationToken = default)
    {
        var pipeline = new[]
        {
            new BsonDocument("$sort", new BsonDocument("dueDate", -1)),
            new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "clients" },
                { "localField", "clientId" },
                { "foreignField", "clientId" },
                { "as", "client" }
            })
        };

        var docs = await _collection.Aggregate<BsonDocument>(pipeline).ToListAsync(cancellationToken);

        return docs.Select(doc =>
        {
            var client = doc.GetValue("client", new BsonArray()).AsBsonArray.FirstOrDefault()?.AsBsonDocument;
            return new InvoiceSummary(
                doc["_id"].AsObjectId.ToString(),
                doc["clientId"].AsString,
                client?.GetValue("name", "Unknown").AsString ?? "Unknown",
                client?.GetValue("email", "").AsString ?? "",
                doc["invoiceNumber"].AsString,
                doc["concept"].AsString,
                doc["amount"].ToDecimal(),
                doc["dueDate"].ToUniversalTime(),
                InvoiceStatusValues.FromValue(doc["status"].AsString));
        }).ToList();
    }

    public async Task<Invoice?> FindByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return null;
        var doc = await _collection.Find(d => d.Id == objectId).FirstOrDefaultAsync(cancellationToken);
        return doc is null ? null : ToDomain(doc);
    }

    public async Task<IReadOnlyList<Invoice>> FindByClientIdAsync(string clientId, CancellationToken cancellationToken = default)
    {
        var docs = await _collection.Find(d => d.ClientId == clientId).ToListAsync(cancellationToken);
        return docs.Select(ToDomain).ToList();
    }

    public async Task<Invoice> CreateAsync(InvoicePropsWithoutId props, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var doc = new InvoiceDocument
        {
            ClientId = props.ClientId,
            InvoiceNumber = props.InvoiceNumber,
            Concept = props.Concept,
            Amount = props.Amount,
            DueDate = props.DueDate,
            Status = InvoiceStatusValues.ToValue(props.Status),
            CreatedAt = now,
            UpdatedAt = now
        };
        await _collection.InsertOneAsync(doc, cancellationToken: cancellationToken);
        return ToDomain(doc);
    }

    public async Task<Invoice> UpdateAsync(string id, InvoiceUpdateProps props, CancellationToken cancellationToken = default)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new InvoiceNotFoundError($"Invoice not found: {id}");

        var update = Builders<InvoiceDocument>.Update.Set(d => d.UpdatedAt, DateTime.UtcNow);
        if (props.Concept is not null) update = update.Set(d => d.Concept, props.Concept);
        if (props.Amount is not null) update = update.Set(d => d.Amount, props.Amount.Value);
        if (props.DueDate is not null) update = update.Set(d => d.DueDate, props.DueDate.Value);
        if (props.Status is not null) update = update.Set(d => d.Status, InvoiceStatusValues.ToValue(props.Status.Value));

        var doc = await _collection.FindOneAndUpdateAsync(
            d => d.Id == objectId,
            update,
            new FindOneAndUpdateOptions<InvoiceDocument> { ReturnDocument = ReturnDocument.After },
            cancellationToken);

        if (doc is null)
            throw new InvoiceNotFoundError($"Invoice not found: {id}");
        return ToDomain(doc);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new InvoiceNotFoundError($"Invoice not found: {id}");

        var result = await _collection.DeleteOneAsync(d => d.Id == objectId, cancellationToken);
        if (result.DeletedCount == 0)
            throw new InvoiceNotFoundError($"Invoice not found: {id}");
    }

    public async Task UpdateStatusAsync(string id, InvoiceStatus status, CancellationToken cancellationToken = default)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            throw new InvoiceNotFoundError($"Invoice not found: {id}");

        var statusValue = InvoiceStatusValues.ToValue(status);
        var result = await _collection.UpdateOneAsync(
            d => d.Id == objectId,
            Builders<InvoiceDocument>.Update
                .Set(d => d.Status, statusValue)
                .Set(d => d.UpdatedAt, DateTime.UtcNow),
            cancellationToken: cancellationToken);

        if (result.MatchedCount == 0)
            throw new InvoiceNotFoundError($"Invoice not found: {id}");
    }

    public async Task<int> CountByYearAsync(int year, CancellationToken cancellationToken = default)
    {
        var start = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = new DateTime(year + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        return (int)await _collection.CountDocumentsAsync(
            d => d.DueDate >= start && d.DueDate < end,
            cancellationToken: cancellationToken);
    }

    private static Invoice ToDomain(InvoiceDocument doc) =>
        Invoice.FromProps(new InvoiceProps(
            doc.Id.ToString(),
            doc.ClientId,
            doc.InvoiceNumber,
            doc.Concept,
            doc.Amount,
            doc.DueDate,
            InvoiceStatusValues.FromValue(doc.Status)));
}

public static class MongoDbConnection
{
    private static IMongoClient? _client;

    public static IMongoDatabase Connect(string uri)
    {
        _client ??= new MongoClient(uri);
        var mongoUrl = new MongoUrl(uri);
        var databaseName = mongoUrl.DatabaseName ?? "monolegal";
        return _client.GetDatabase(databaseName);
    }

    public static Task DisconnectAsync()
    {
        _client = null;
        return Task.CompletedTask;
    }
}
