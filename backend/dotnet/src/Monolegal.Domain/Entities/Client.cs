namespace Monolegal.Domain.Entities;

public record ClientProps(string Id, string Name, string Email);

public class Client
{
    public string Id { get; }
    public string Name { get; }
    public string Email { get; }

    private Client(ClientProps props)
    {
        Id = props.Id;
        Name = props.Name;
        Email = props.Email;
    }

    public static Client Create(ClientProps props)
    {
        if (string.IsNullOrWhiteSpace(props.Id))
            throw new Errors.ClientValidationError("Client id is required");
        if (string.IsNullOrWhiteSpace(props.Name))
            throw new Errors.ClientValidationError("Client name is required");
        if (string.IsNullOrWhiteSpace(props.Email))
            throw new Errors.ClientValidationError("Client email is required");
        if (!IsValidEmail(props.Email.Trim()))
            throw new Errors.ClientValidationError("Client email format is invalid");

        return new Client(new ClientProps(
            props.Id.Trim(),
            props.Name.Trim(),
            props.Email.Trim().ToLowerInvariant()));
    }

    public static Client FromProps(ClientProps props) => Create(props);

    public ClientProps ToProps() => new(Id, Name, Email);

    private static bool IsValidEmail(string email) =>
        System.Text.RegularExpressions.Regex.IsMatch(email, @"^[^\s@]+@[^\s@]+\.[^\s@]+$");
}
