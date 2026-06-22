using DomainLogger = Monolegal.Domain.Ports.ILogger;
using Serilog;
using Serilog.Events;

namespace Monolegal.Infrastructure.Logging;

public class SerilogLoggerAdapter(Serilog.ILogger logger) : DomainLogger
{
    public void Debug(string message, IReadOnlyDictionary<string, object?>? context = null) =>
        Write(LogEventLevel.Debug, message, context);

    public void Info(string message, IReadOnlyDictionary<string, object?>? context = null) =>
        Write(LogEventLevel.Information, message, context);

    public void Warn(string message, IReadOnlyDictionary<string, object?>? context = null) =>
        Write(LogEventLevel.Warning, message, context);

    public void Error(string message, IReadOnlyDictionary<string, object?>? context = null) =>
        Write(LogEventLevel.Error, message, context);

    public DomainLogger Child(IReadOnlyDictionary<string, object?> context)
    {
        var child = logger;
        foreach (var (key, value) in context)
            child = child.ForContext(key, value);
        return new SerilogLoggerAdapter(child);
    }

    private void Write(LogEventLevel level, string message, IReadOnlyDictionary<string, object?>? context)
    {
        var enriched = logger;
        if (context is not null)
        {
            foreach (var (key, value) in context)
                enriched = enriched.ForContext(key, value);
        }
        enriched.Write(level, message);
    }
}

public static class SerilogConfiguration
{
    public static Serilog.ILogger CreateLogger(string serviceName, string logLevel)
    {
        var level = Enum.TryParse<LogEventLevel>(logLevel, true, out var parsed)
            ? parsed
            : LogEventLevel.Information;

        return new Serilog.LoggerConfiguration()
            .MinimumLevel.Is(level)
            .Enrich.WithProperty("service", serviceName)
            .WriteTo.Console(outputTemplate:
                "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties}{NewLine}{Exception}")
            .CreateLogger();
    }
}
