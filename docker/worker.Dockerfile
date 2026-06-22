# ── Stage 1: Build ──
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/dotnet/ ./
RUN dotnet restore Monolegal.sln \
    && dotnet publish src/Monolegal.Worker/Monolegal.Worker.csproj -c Release -o /app/publish --no-restore

# ── Stage 2: Production ──
FROM mcr.microsoft.com/dotnet/runtime:8.0 AS production
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Monolegal.Worker.dll"]
