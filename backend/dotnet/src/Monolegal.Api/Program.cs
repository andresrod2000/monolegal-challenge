using Monolegal.Api.Dtos;
using Monolegal.Api.Middleware;
using Monolegal.Application;
using Monolegal.Domain.Entities;
using Monolegal.Infrastructure;
using Monolegal.Infrastructure.Persistence;
using Monolegal.Shared;

var builder = WebApplication.CreateBuilder(args);

var settings = DependencyInjection.LoadSettingsFromEnvironment("api");
builder.Services.AddMonolegalInfrastructure(settings);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(settings.CorsOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();
app.UseCors();
app.UseCorrelationId();
app.UseGlobalExceptionHandler();

var deps = app.Services.GetRequiredService<ApiDependencies>();

app.MapGet("/health", () => Results.Json(new HealthResponse("ok", "api", DateTime.UtcNow.ToString("O"))));

app.MapGet("/api/clients", async () =>
{
    var clients = await deps.GetClientsUseCase.ExecuteAsync();
    var data = clients.Select(Mappers.ToDto).ToList();
    return Results.Json(new CollectionResponse<ClientDto>(data, new MetaResponse(data.Count)));
});

app.MapGet("/api/clients/{id}", async (string id) =>
{
    var client = await deps.GetClientByIdUseCase.ExecuteAsync(id);
    return Results.Json(new ResourceResponse<ClientDto>(Mappers.ToDto(client)));
});

app.MapPost("/api/clients", async (CreateClientBody body) =>
{
    var client = await deps.CreateClientUseCase.ExecuteAsync(new CreateClientInput(body.Id, body.Name, body.Email));
    return Results.Json(new ResourceResponse<ClientDto>(Mappers.ToDto(client)), statusCode: StatusCodes.Status201Created);
});

app.MapMethods("/api/clients/{id}", ["PATCH"], async (string id, UpdateClientBody body) =>
{
    var client = await deps.UpdateClientUseCase.ExecuteAsync(id, new UpdateClientInput(body.Name, body.Email));
    return Results.Json(new ResourceResponse<ClientDto>(Mappers.ToDto(client)));
});

app.MapDelete("/api/clients/{id}", async (string id) =>
{
    await deps.DeleteClientUseCase.ExecuteAsync(id);
    return Results.NoContent();
});

app.MapGet("/api/invoices", async () =>
{
    var invoices = await deps.GetInvoicesSummaryUseCase.ExecuteAsync();
    var data = invoices.Select(Mappers.ToSummaryDto).ToList();
    return Results.Json(new CollectionResponse<InvoiceSummaryDto>(data, new MetaResponse(data.Count)));
});

app.MapGet("/api/invoices/{id}", async (string id) =>
{
    var invoice = await deps.GetInvoiceByIdUseCase.ExecuteAsync(id);
    return Results.Json(new ResourceResponse<InvoiceDetailDto>(Mappers.ToDetailDto(invoice)));
});

app.MapPost("/api/invoices", async (CreateInvoiceBody body) =>
{
    var invoice = await deps.CreateInvoiceUseCase.ExecuteAsync(new CreateInvoiceInput(
        body.ClientId,
        body.Concept,
        body.Amount,
        DateTime.Parse(body.DueDate).ToUniversalTime(),
        body.Status));
    return Results.Json(new ResourceResponse<InvoiceDetailDto>(Mappers.ToDetailDto(invoice)), statusCode: StatusCodes.Status201Created);
});

app.MapMethods("/api/invoices/{id}", ["PATCH"], async (string id, UpdateInvoiceBody body) =>
{
    var update = new InvoiceUpdateProps(
        body.Concept,
        body.Amount,
        body.DueDate is null ? null : DateTime.Parse(body.DueDate).ToUniversalTime(),
        body.Status);
    var invoice = await deps.UpdateInvoiceUseCase.ExecuteAsync(id, update);
    return Results.Json(new ResourceResponse<InvoiceDetailDto>(Mappers.ToDetailDto(invoice)));
});

app.MapDelete("/api/invoices/{id}", async (string id) =>
{
    await deps.DeleteInvoiceUseCase.ExecuteAsync(id);
    return Results.NoContent();
});

app.MapPost("/api/overdue/process", async () =>
{
    var result = await deps.ProcessOverdueInvoicesUseCase.ExecuteAsync();
    return Results.Json(new ResourceResponse<ProcessOverdueResponse>(
        new ProcessOverdueResponse(result.Transitioned, result.Failed)));
});

app.MapPost("/api/reminders/process", async () =>
{
    var result = await deps.ProcessInvoiceRemindersUseCase.ExecuteAsync();
    return Results.Json(new ResourceResponse<ProcessRemindersResponse>(
        new ProcessRemindersResponse(result.Processed, result.Failed)));
});

app.MapPost("/api/reminders/process/{invoiceId}", async (string invoiceId) =>
{
    var result = await deps.ProcessInvoiceRemindersUseCase.ExecuteForInvoiceIdAsync(invoiceId);
    return Results.Json(new ResourceResponse<ProcessRemindersResponse>(
        new ProcessRemindersResponse(result.Processed, result.Failed)));
});

app.MapFallback(() => Results.Json(new ErrorResponse(new ErrorBody("Not found")), statusCode: StatusCodes.Status404NotFound));

var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStopping.Register(() => MongoDbConnection.DisconnectAsync().GetAwaiter().GetResult());

var port = Environment.GetEnvironmentVariable("API_PORT") ?? "4000";
app.Urls.Add($"http://+:{port}");

app.Run();

public partial class Program;
