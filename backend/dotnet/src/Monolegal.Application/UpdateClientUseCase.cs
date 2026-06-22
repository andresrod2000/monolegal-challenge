using Monolegal.Domain.Entities;
using Monolegal.Domain.Errors;
using Monolegal.Domain.Ports;

namespace Monolegal.Application;

public record UpdateClientInput(string? Name, string? Email);

public class UpdateClientUseCase(IClientRepository clientRepository, ILogger logger)
{
    public async Task<Client> ExecuteAsync(string id, UpdateClientInput input, CancellationToken cancellationToken = default)
    {
        var existing = await clientRepository.FindByIdAsync(id, cancellationToken);
        if (existing is null)
            throw new ClientNotFoundError($"Client not found: {id}");

        var name = input.Name ?? existing.Name;
        var email = input.Email ?? existing.Email;
        Client.Create(new ClientProps(existing.Id, name, email));

        var client = await clientRepository.UpdateAsync(id, name, email, cancellationToken);
        logger.Info("Client updated", new Dictionary<string, object?> { ["clientId"] = id });
        return client;
    }
}
