# monolegal-challenge

Sistema de gestión de facturación, clientes, recordatorios automáticos y dashboard operativo — Reto del Arquitecto Monolegal.

## Stack

- **Backend & Worker:** .NET 8 (ASP.NET Core + Worker Service)
- **Base de datos:** MongoDB
- **Frontend:** Next.js (React)
- **Tests:** xUnit (.NET) + ESLint/Prettier (frontend)
- **Despliegue:** Docker, Docker Swarm, Traefik

## Capacidades

- **Clientes:** CRUD completo; ver y editar el email de destino de los recordatorios.
- **Facturas:** CRUD con concepto, número (`INV-YYYY-NNNN`), monto, vencimiento y estado.
- **Worker:** envío automático de recordatorios usando el email actual del cliente.
- **Dashboard:** pestañas Facturas / Clientes, formularios de alta y edición.
- **Seed aleatorio:** `npm run seed` genera 15 facturas con fechas entre **2 días antes y 7 días después** de hoy, concepto y monto aleatorios; el estado se deriva del vencimiento.
- **Dummy data en UI:** botón "Generar dummy data" al crear factura (concepto, monto y fecha entre hoy y +7 días).
- **Recordatorios manuales:** botón global "Ejecutar recordatorios" y botón "Recordatorio" por factura elegible (primer/segundo recordatorio).

## Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Trazabilidad al reto, diagramas SVG visuales, stack backend/frontend, Clean Architecture, ADRs con justificación de decisiones
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Guía de despliegue (Hito 5)

## Estructura del monorepo

```
backend/dotnet/         → Solución .NET (Shared, Domain, Application, Infrastructure, Api, Worker, Seed)
apps/frontend/          → Dashboard Next.js
```

## Inicio rápido (desarrollo)

Requisitos: **.NET 8 SDK**, **Node.js 20**, MongoDB.

```bash
npm install
npm run build
cp .env.example .env
# Configurar GMAIL_USER y GMAIL_APP_PASSWORD si EMAIL_PROVIDER=gmail
npm run seed          # Re-ejecutar tras cambios de schema
npm run dev:api       # API .NET en puerto 4000
npm run dev:worker    # Worker .NET (cron)
npm run dev:frontend  # Puerto 3000
npm test              # dotnet test
```

## CI/CD

### CI (Integración continua)

Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — se ejecuta en **pull requests** y **push** a `main`, `develop` y `uat`.

Valida en cada ejecución:

- `npm run lint` — ESLint (frontend y scripts)
- `npm run format:check` — formato Prettier
- `dotnet build` + `dotnet test` — backend .NET
- `npm run build --prefix apps/frontend` — frontend Next.js

Reproducir localmente:

```bash
npm run ci
```

### CD (Despliegue continuo)

Workflow [`.github/workflows/build.yml`](.github/workflows/build.yml) — construye y publica imágenes Docker en EC2.

- Se dispara **solo tras un CI exitoso** en push a `main`, `develop` o `uat`.
- En PRs corre únicamente el CI; el CD no se ejecuta.
- `workflow_dispatch` permite un despliegue manual de emergencia sin esperar CI.

Configurar en GitHub (**Settings → Branches**) la regla de protección que exija el check **CI / quality** antes de mergear.

Ver ejecuciones en la pestaña **Actions** del repositorio.

## Hitos

| Hito | Estado | Descripción                                                    |
| ---- | ------ | -------------------------------------------------------------- |
| 1    | ✅     | Estructura base, ARCHITECTURE.md, interfaces DI                |
| 2    | ✅     | Dominio, casos de uso, tests xUnit                               |
| 3    | ✅     | MongoDB, Gmail, seed, worker, API                              |
| 4    | ✅     | Dashboard Next.js                                              |
| 5    | ✅     | Docker, Swarm, Traefik, DEPLOYMENT.md                          |
| 6    | ✅     | Entidad Client, CRUD, gestión de emails, facturas con concepto |
