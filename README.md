# monolegal-challenge

Sistema de gestión de facturación, clientes, recordatorios automáticos y dashboard operativo — Reto del Arquitecto Monolegal.

## Stack

- **Backend & Worker:** Node.js + TypeScript
- **Base de datos:** MongoDB
- **Frontend:** Next.js (React)
- **Tests:** Jest
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

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Modelo de dominio, API REST, Clean Architecture y SOLID (§6.2)
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Guía de despliegue (Hito 5)

## Estructura del monorepo

```
packages/shared         → Tipos y enums compartidos
packages/domain         → Entidades Client/Invoice, ports y errores
packages/application    → Casos de uso (CRUD + recordatorios)
packages/infrastructure → Adaptadores (MongoDB, Gmail, DI)
apps/api                → REST API
apps/worker             → Cron job de recordatorios
apps/frontend           → Dashboard Next.js
```

## Inicio rápido (desarrollo)

```bash
npm install
npm run build
cp .env.example .env
# Configurar GMAIL_USER y GMAIL_APP_PASSWORD si EMAIL_PROVIDER=gmail
npm run seed          # Re-ejecutar tras cambios de schema
npm run dev:api      # Puerto 4000
npm run dev:worker   # Cron + procesamiento
npm run dev:frontend # Puerto 3000
npm test
```

## CI/CD

### CI (Integración continua)

Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — se ejecuta en **pull requests** y **push** a `main`, `develop` y `uat`.

Valida en cada ejecución:

- `npm run lint` — ESLint en el monorepo
- `npm run format:check` — formato Prettier
- `npm run build` — compilación de packages, API, worker y frontend
- `npm test` — tests unitarios Jest (sin MongoDB ni Gmail)

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
| 2    | ✅     | Dominio, casos de uso, tests Jest                              |
| 3    | ✅     | MongoDB, Gmail, seed, worker, API                              |
| 4    | ✅     | Dashboard Next.js                                              |
| 5    | ✅     | Docker, Swarm, Traefik, DEPLOYMENT.md                          |
| 6    | ✅     | Entidad Client, CRUD, gestión de emails, facturas con concepto |
