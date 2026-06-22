using Monolegal.Application;
using Monolegal.Domain.Ports;
using Monolegal.Infrastructure.Email;
using Monolegal.Infrastructure.Logging;
using Monolegal.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace Monolegal.Infrastructure;

public class MonolegalSettings
{
    public string MongoDbUri { get; set; } = "mongodb://localhost:27017/monolegal";
    public string EmailProvider { get; set; } = "mock";
    public string? GmailUser { get; set; }
    public string? GmailAppPassword { get; set; }
    public string ServiceName { get; set; } = "monolegal";
    public string LogLevel { get; set; } = "info";
    public string CorsOrigin { get; set; } = "http://localhost:3000";
    public string CronSchedule { get; set; } = "0 8 * * *";
    public bool RunOnStart { get; set; }
}

public class ApiDependencies
{
    public required ILogger Logger { get; init; }
    public required GetInvoicesSummaryUseCase GetInvoicesSummaryUseCase { get; init; }
    public required GetInvoiceByIdUseCase GetInvoiceByIdUseCase { get; init; }
    public required CreateInvoiceUseCase CreateInvoiceUseCase { get; init; }
    public required UpdateInvoiceUseCase UpdateInvoiceUseCase { get; init; }
    public required DeleteInvoiceUseCase DeleteInvoiceUseCase { get; init; }
    public required GetClientsUseCase GetClientsUseCase { get; init; }
    public required GetClientByIdUseCase GetClientByIdUseCase { get; init; }
    public required CreateClientUseCase CreateClientUseCase { get; init; }
    public required UpdateClientUseCase UpdateClientUseCase { get; init; }
    public required DeleteClientUseCase DeleteClientUseCase { get; init; }
    public required ProcessOverdueInvoicesUseCase ProcessOverdueInvoicesUseCase { get; init; }
    public required ProcessInvoiceRemindersUseCase ProcessInvoiceRemindersUseCase { get; init; }
}

public static class DependencyInjection
{
    public static IServiceCollection AddMonolegalInfrastructure(
        this IServiceCollection services,
        MonolegalSettings settings)
    {
        var serilog = SerilogConfiguration.CreateLogger(settings.ServiceName, settings.LogLevel);
        var logger = new SerilogLoggerAdapter(serilog);
        var database = MongoDbConnection.Connect(settings.MongoDbUri);

        services.AddSingleton(settings);
        services.AddSingleton(serilog);
        services.AddSingleton<ILogger>(logger);
        services.AddSingleton(database);
        services.AddSingleton<IClientRepository, MongoClientRepository>();
        services.AddSingleton<IInvoiceRepository, MongoInvoiceRepository>();
        services.AddSingleton<IInvoiceSeeder, MongoInvoiceSeeder>();

        if (settings.EmailProvider.Equals("gmail", StringComparison.OrdinalIgnoreCase))
        {
            services.AddSingleton<IEmailProvider>(sp =>
                new GmailEmailProvider(
                    settings.GmailUser ?? string.Empty,
                    settings.GmailAppPassword ?? string.Empty,
                    sp.GetRequiredService<ILogger>()));
        }
        else
        {
            services.AddSingleton<IEmailProvider, MockEmailProvider>();
        }

        services.AddSingleton<ProcessOverdueInvoicesUseCase>();
        services.AddSingleton<ProcessInvoiceRemindersUseCase>();
        services.AddSingleton<GetInvoicesSummaryUseCase>();
        services.AddSingleton<GetInvoiceByIdUseCase>();
        services.AddSingleton<CreateInvoiceUseCase>();
        services.AddSingleton<UpdateInvoiceUseCase>();
        services.AddSingleton<DeleteInvoiceUseCase>();
        services.AddSingleton<GetClientsUseCase>();
        services.AddSingleton<GetClientByIdUseCase>();
        services.AddSingleton<CreateClientUseCase>();
        services.AddSingleton<UpdateClientUseCase>();
        services.AddSingleton<DeleteClientUseCase>();

        services.AddSingleton(sp => new ApiDependencies
        {
            Logger = sp.GetRequiredService<ILogger>(),
            GetInvoicesSummaryUseCase = sp.GetRequiredService<GetInvoicesSummaryUseCase>(),
            GetInvoiceByIdUseCase = sp.GetRequiredService<GetInvoiceByIdUseCase>(),
            CreateInvoiceUseCase = sp.GetRequiredService<CreateInvoiceUseCase>(),
            UpdateInvoiceUseCase = sp.GetRequiredService<UpdateInvoiceUseCase>(),
            DeleteInvoiceUseCase = sp.GetRequiredService<DeleteInvoiceUseCase>(),
            GetClientsUseCase = sp.GetRequiredService<GetClientsUseCase>(),
            GetClientByIdUseCase = sp.GetRequiredService<GetClientByIdUseCase>(),
            CreateClientUseCase = sp.GetRequiredService<CreateClientUseCase>(),
            UpdateClientUseCase = sp.GetRequiredService<UpdateClientUseCase>(),
            DeleteClientUseCase = sp.GetRequiredService<DeleteClientUseCase>(),
            ProcessOverdueInvoicesUseCase = sp.GetRequiredService<ProcessOverdueInvoicesUseCase>(),
            ProcessInvoiceRemindersUseCase = sp.GetRequiredService<ProcessInvoiceRemindersUseCase>()
        });

        logger.Info("Container initialized", new Dictionary<string, object?>
        {
            ["emailProvider"] = settings.EmailProvider,
            ["service"] = settings.ServiceName
        });

        return services;
    }

    public static MonolegalSettings LoadSettingsFromEnvironment(string serviceName)
    {
        return new MonolegalSettings
        {
            MongoDbUri = Environment.GetEnvironmentVariable("MONGODB_URI")
                ?? Environment.GetEnvironmentVariable("ConnectionStrings__MongoDb")
                ?? "mongodb://localhost:27017/monolegal",
            EmailProvider = Environment.GetEnvironmentVariable("EMAIL_PROVIDER")
                ?? Environment.GetEnvironmentVariable("Email__Provider")
                ?? "mock",
            GmailUser = Environment.GetEnvironmentVariable("GMAIL_USER")
                ?? Environment.GetEnvironmentVariable("Email__GmailUser"),
            GmailAppPassword = Environment.GetEnvironmentVariable("GMAIL_APP_PASSWORD")
                ?? Environment.GetEnvironmentVariable("Email__GmailAppPassword"),
            ServiceName = serviceName,
            LogLevel = Environment.GetEnvironmentVariable("LOG_LEVEL")
                ?? Environment.GetEnvironmentVariable("Serilog__MinimumLevel")
                ?? "info",
            CorsOrigin = Environment.GetEnvironmentVariable("CORS_ORIGIN")
                ?? Environment.GetEnvironmentVariable("Cors__Origin")
                ?? "http://localhost:3000",
            CronSchedule = Environment.GetEnvironmentVariable("CRON_SCHEDULE")
                ?? Environment.GetEnvironmentVariable("Worker__CronSchedule")
                ?? "0 8 * * *",
            RunOnStart = (Environment.GetEnvironmentVariable("RUN_ON_START")
                ?? Environment.GetEnvironmentVariable("Worker__RunOnStart")
                ?? "false").Equals("true", StringComparison.OrdinalIgnoreCase)
        };
    }
}
