using Monolegal.Domain.Entities;
using Monolegal.Domain.Errors;
using Monolegal.Domain.Ports;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace Monolegal.Infrastructure.Persistence;

[BsonIgnoreExtraElements]
public class ClientDocument
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("clientId")]
    public string ClientId { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime? CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; }
}

public class MongoClientRepository(IMongoDatabase database) : IClientRepository
{
    private readonly IMongoCollection<ClientDocument> _collection =
        database.GetCollection<ClientDocument>("clients");

    public async Task<IReadOnlyList<Client>> FindAllAsync(CancellationToken cancellationToken = default)
    {
        var docs = await _collection.Find(FilterDefinition<ClientDocument>.Empty)
            .SortBy(d => d.Name)
            .ToListAsync(cancellationToken);
        return docs.Select(ToDomain).ToList();
    }

    public async Task<Client?> FindByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var doc = await _collection.Find(d => d.ClientId == id).FirstOrDefaultAsync(cancellationToken);
        return doc is null ? null : ToDomain(doc);
    }

    public async Task<Client> CreateAsync(ClientProps props, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var doc = new ClientDocument
        {
            ClientId = props.Id,
            Name = props.Name,
            Email = props.Email,
            CreatedAt = now,
            UpdatedAt = now
        };
        await _collection.InsertOneAsync(doc, cancellationToken: cancellationToken);
        return ToDomain(doc);
    }

    public async Task<Client> UpdateAsync(string id, string? name, string? email, CancellationToken cancellationToken = default)
    {
        var update = Builders<ClientDocument>.Update
            .Set(d => d.UpdatedAt, DateTime.UtcNow);
        if (name is not null) update = update.Set(d => d.Name, name);
        if (email is not null) update = update.Set(d => d.Email, email);

        var doc = await _collection.FindOneAndUpdateAsync(
            d => d.ClientId == id,
            update,
            new FindOneAndUpdateOptions<ClientDocument> { ReturnDocument = ReturnDocument.After },
            cancellationToken);

        if (doc is null)
            throw new ClientNotFoundError($"Client not found: {id}");
        return ToDomain(doc);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var result = await _collection.DeleteOneAsync(d => d.ClientId == id, cancellationToken);
        if (result.DeletedCount == 0)
            throw new ClientNotFoundError($"Client not found: {id}");
    }

    public async Task<bool> ExistsAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection.CountDocumentsAsync(d => d.ClientId == id, cancellationToken: cancellationToken) > 0;
    }

    private static Client ToDomain(ClientDocument doc) =>
        Client.FromProps(new ClientProps(doc.ClientId, doc.Name, doc.Email));
}
