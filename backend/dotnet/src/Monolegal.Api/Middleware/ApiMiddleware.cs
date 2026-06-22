using Monolegal.Domain.Errors;

namespace Monolegal.Api.Middleware;

public class CorrelationIdMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers.TryGetValue(HeaderName, out var existing) && !string.IsNullOrWhiteSpace(existing)
            ? existing.ToString()
            : Guid.NewGuid().ToString();

        context.Items["CorrelationId"] = correlationId;
        context.Response.Headers[HeaderName] = correlationId;
        await next(context);
    }
}

public class GlobalExceptionMiddleware(RequestDelegate next, Domain.Ports.ILogger logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            var (status, message) = ex switch
            {
                ClientValidationError or InvoiceValidationError or InvoiceTransitionError or ClientHasInvoicesError => (400, ex.Message),
                ClientNotFoundError or InvoiceNotFoundError => (404, ex.Message),
                DomainError => (400, ex.Message),
                _ => (500, "Internal server error")
            };

            if (status >= 500)
            {
                logger.Error("Unhandled exception", new Dictionary<string, object?>
                {
                    ["error"] = ex.Message,
                    ["correlationId"] = context.Items["CorrelationId"]
                });
            }

            context.Response.StatusCode = status;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { error = new { message } });
        }
    }
}

public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app) =>
        app.UseMiddleware<CorrelationIdMiddleware>();

    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app) =>
        app.UseMiddleware<GlobalExceptionMiddleware>();
}
