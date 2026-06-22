# Monolegal Backend (.NET 8)

Backend migrado desde Node/TypeScript con Clean Architecture.

## Estructura

```
src/
├── Monolegal.Shared/          # Enums y utilidades compartidas
├── Monolegal.Domain/          # Entidades, ports y errores
├── Monolegal.Application/     # Casos de uso
├── Monolegal.Infrastructure/  # MongoDB, email, logging, DI
├── Monolegal.Api/             # ASP.NET Core REST API
├── Monolegal.Worker/          # Worker Service (cron)
└── Monolegal.Seed/            # Seed de datos
tests/
├── Monolegal.Shared.Tests/
├── Monolegal.Domain.Tests/
├── Monolegal.Application.Tests/
└── Monolegal.Api.Contract.Tests/
```

## Variables de entorno

| Variable Node (`.env`) | Equivalente .NET |
|---|---|
| `MONGODB_URI` | `MONGODB_URI` o `ConnectionStrings__MongoDb` |
| `EMAIL_PROVIDER` | `EMAIL_PROVIDER` o `Email__Provider` |
| `GMAIL_USER` | `GMAIL_USER` o `Email__GmailUser` |
| `GMAIL_APP_PASSWORD` | `GMAIL_APP_PASSWORD` o `Email__GmailAppPassword` |
| `API_PORT` | `API_PORT` (default `4000`) |
| `CORS_ORIGIN` | `CORS_ORIGIN` o `Cors__Origin` |
| `CRON_SCHEDULE` | `CRON_SCHEDULE` o `Worker__CronSchedule` |
| `RUN_ON_START` | `RUN_ON_START` o `Worker__RunOnStart` |
| `LOG_LEVEL` | `LOG_LEVEL` o `Serilog__MinimumLevel` |

## Comandos

```bash
# Restaurar y compilar
dotnet restore
dotnet build

# Tests
dotnet test

# API (puerto 4000)
dotnet run --project src/Monolegal.Api

# Worker
dotnet run --project src/Monolegal.Worker

# Seed
dotnet run --project src/Monolegal.Seed
```

## Contrato REST

La API preserva el contrato documentado en `ARCHITECTURE.md` §11:

- Colecciones: `{ "data": [...], "meta": { "total": N } }`
- Recurso: `{ "data": { ... } }`
- Error: `{ "error": { "message": "..." } }`
- DELETE: `204 No Content`
