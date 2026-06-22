# ── Stage 1: Build ──
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/dotnet/ ./
RUN dotnet restore Monolegal.sln \
    && dotnet publish src/Monolegal.Api/Monolegal.Api.csproj -c Release -o /app/publish --no-restore

# ── Stage 2: Production ──
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS production
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production
ENV API_PORT=4000
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:4000/health || exit 1
ENTRYPOINT ["dotnet", "Monolegal.Api.dll"]
