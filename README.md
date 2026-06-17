# monolegal-challenge

Sistema de automatización de notificaciones de facturación y dashboard de visualización — Reto del Arquitecto Monolegal.

## Stack

- **Backend & Worker:** Node.js + TypeScript
- **Base de datos:** MongoDB
- **Frontend:** Next.js (React)
- **Tests:** Jest
- **Despliegue:** Docker, Docker Swarm, Traefik

## Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Decisiones arquitectónicas y capas Clean Architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Guía de despliegue (Hito 5)

## Estructura del monorepo

```
packages/shared         → Tipos y enums compartidos
packages/domain         → Entidades e interfaces (ports)
packages/application    → Casos de uso
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
npm run seed
npm run dev:api      # Puerto 4000
npm run dev:worker   # Cron + procesamiento
npm run dev:frontend # Puerto 3000
npm test
```

## Hitos

| Hito | Estado | Descripción |
|------|--------|-------------|
| 1 | ✅ | Estructura base, ARCHITECTURE.md, interfaces DI |
| 2 | ✅ | Dominio, casos de uso, tests Jest |
| 3 | ✅ | MongoDB, Gmail, seed, worker, API |
| 4 | ✅ | Dashboard Next.js |
| 5 | ✅ | Docker, Swarm, Traefik, DEPLOYMENT.md |
