using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Monolegal.Api.Contract.Tests;

public class ApiContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiContractTests(WebApplicationFactory<Program> factory)
    {
        Environment.SetEnvironmentVariable("MONGODB_URI", "mongodb://localhost:27017/monolegal_test");
        Environment.SetEnvironmentVariable("EMAIL_PROVIDER", "mock");
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_ReturnsExpectedShape()
    {
        var response = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("ok", json.GetProperty("status").GetString());
        Assert.Equal("api", json.GetProperty("service").GetString());
        Assert.True(json.TryGetProperty("timestamp", out _));
    }

    [Fact]
    public async Task NotFound_ReturnsErrorShape()
    {
        var response = await _client.GetAsync("/api/unknown-route");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(json.TryGetProperty("error", out var error));
        Assert.True(error.TryGetProperty("message", out _));
    }
}
