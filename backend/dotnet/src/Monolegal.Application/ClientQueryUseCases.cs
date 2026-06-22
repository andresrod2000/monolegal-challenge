using Monolegal.Domain.Entities;
using Monolegal.Domain.Errors;
using Monolegal.Domain.Ports;

namespace Monolegal.Application;

public class GetClientsUseCase(IClientRepository clientRepository, ILogger logger)
{
    public async Task<IReadOnlyList<Client>> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        var clients = await clientRepository.FindAllAsync(cancellationToken);
        logger.Debug("Clients listed", new Dictionary<string, object?> { ["count"] = clients.Count });
        return clients;
    }
}

public class GetClientByIdUseCase(IClientRepository clientRepository, ILogger logger)
{
    public async Task<Client> ExecuteAsync(string id, CancellationToken cancellationToken = default)
    {
        var client = await clientRepository.FindByIdAsync(id, cancellationToken);
        if (client is null)
            throw new ClientNotFoundError($"Client not found: {id}");
        return client;
    }
}
