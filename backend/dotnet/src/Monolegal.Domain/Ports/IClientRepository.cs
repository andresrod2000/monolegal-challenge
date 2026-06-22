using Monolegal.Domain.Entities;

namespace Monolegal.Domain.Ports;

public interface IClientRepository
{
    Task<IReadOnlyList<Client>> FindAllAsync(CancellationToken cancellationToken = default);
    Task<Client?> FindByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Client> CreateAsync(ClientProps props, CancellationToken cancellationToken = default);
    Task<Client> UpdateAsync(string id, string? name, string? email, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string id, CancellationToken cancellationToken = default);
}
