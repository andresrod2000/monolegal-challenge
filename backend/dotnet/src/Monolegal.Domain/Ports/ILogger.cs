namespace Monolegal.Domain.Ports;

public interface ILogger
{
    void Debug(string message, IReadOnlyDictionary<string, object?>? context = null);
    void Info(string message, IReadOnlyDictionary<string, object?>? context = null);
    void Warn(string message, IReadOnlyDictionary<string, object?>? context = null);
    void Error(string message, IReadOnlyDictionary<string, object?>? context = null);
    ILogger Child(IReadOnlyDictionary<string, object?> context);
}
