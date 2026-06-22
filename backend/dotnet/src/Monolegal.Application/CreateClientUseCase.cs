using Monolegal.Domain.Entities;
using Monolegal.Domain.Ports;

namespace Monolegal.Application;

public record CreateClientInput(string Id, string Name, string Email);

public class CreateClientUseCase(IClientRepository clientRepository, ILogger logger)
{
    public async Task<Client> ExecuteAsync(CreateClientInput input, CancellationToken cancellationToken = default)
    {
        var props = new ClientProps(input.Id, input.Name, input.Email);
        Client.Create(props);
        var client = await clientRepository.CreateAsync(props, cancellationToken);
        logger.Info("Client created", new Dictionary<string, object?> { ["clientId"] = client.Id });
        return client;
    }
}
