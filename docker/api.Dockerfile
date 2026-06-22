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
COPY --from=build /app/publish .
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1
ENTRYPOINT ["dotnet", "Monolegal.Api.dll"]
