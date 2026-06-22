using Monolegal.Application;
using Monolegal.Infrastructure;
using Monolegal.Infrastructure.Persistence;
using NCrontab;

namespace Monolegal.Worker;

public class ReminderWorker(
    ProcessOverdueInvoicesUseCase overdueUseCase,
    ProcessInvoiceRemindersUseCase remindersUseCase,
    Domain.Ports.ILogger logger,
    MonolegalSettings settings) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        CrontabSchedule schedule;
        try
        {
            schedule = CrontabSchedule.Parse(settings.CronSchedule);
        }
        catch (Exception)
        {
            logger.Error("Invalid CRON_SCHEDULE", new Dictionary<string, object?> { ["schedule"] = settings.CronSchedule });
            Environment.Exit(1);
            return;
        }

        if (settings.RunOnStart)
        {
            logger.Info("RUN_ON_START enabled — executing job immediately");
            await RunJobAsync(stoppingToken);
        }

        logger.Info("Worker scheduler started", new Dictionary<string, object?> { ["schedule"] = settings.CronSchedule });

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var next = schedule.GetNextOccurrence(now);
            var delay = next - now;
            if (delay > TimeSpan.Zero)
                await Task.Delay(delay, stoppingToken);

            await RunJobAsync(stoppingToken);
        }
    }

    private async Task RunJobAsync(CancellationToken cancellationToken)
    {
        var jobLogger = logger.Child(new Dictionary<string, object?> { ["correlationId"] = Guid.NewGuid().ToString() });
        jobLogger.Info("Worker job started");

        var overdueResult = await overdueUseCase.ExecuteAsync(cancellationToken: cancellationToken);
        var reminderResult = await remindersUseCase.ExecuteAsync(cancellationToken);

        jobLogger.Info("Worker job finished", new Dictionary<string, object?>
        {
            ["overdue"] = new { transitioned = overdueResult.Transitioned, failed = overdueResult.Failed },
            ["reminders"] = new { processed = reminderResult.Processed, failed = reminderResult.Failed }
        });
    }
}

public class Program
{
    public static void Main(string[] args)
    {
        var builder = Host.CreateApplicationBuilder(args);
        var settings = DependencyInjection.LoadSettingsFromEnvironment("worker");
        builder.Services.AddMonolegalInfrastructure(settings);
        builder.Services.AddHostedService<ReminderWorker>();

        var host = builder.Build();
        var lifetime = host.Services.GetRequiredService<IHostApplicationLifetime>();
        lifetime.ApplicationStopping.Register(() => MongoDbConnection.DisconnectAsync().GetAwaiter().GetResult());

        host.Run();
    }
}
