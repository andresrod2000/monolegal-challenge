# Arquitectura — Monolegal Challenge

Documento de referencia arquitectónica para el sistema de gestión de facturación, clientes, recordatorios automáticos y dashboard operativo.

---

## 1. Visión general

El sistema procesa recordatorios de facturación de forma **asíncrona** mediante un Worker en segundo plano, mientras expone una **API REST** con CRUD de clientes y facturas, y un **dashboard Next.js** para gestión operativa.

```mermaid
flowchart TB
    subgraph presentation [Presentation Layer]
        Frontend[Next.js Dashboard]
        APIRoutes[Express REST Routes]
    end

    subgraph application [Application Layer]
        ProcessUC[ProcessInvoiceRemindersUseCase]
        InvoiceUCs[Invoice CRUD Use Cases]
        ClientUCs[Client CRUD Use Cases]
    end

    subgraph domain [Domain Layer]
        ClientEntity[Client Entity]
        InvoiceEntity[Invoice Entity]
        IClientRepo[IClientRepository]
        IInvoiceRepo[IInvoiceRepository]
        IEmailProv[IEmailProvider]
        ILoggerPort[ILogger]
    end

    subgraph infrastructure [Infrastructure Layer]
        MongoClientRepo[MongoClientRepository]
        MongoInvoiceRepo[MongoInvoiceRepository]
        GmailProv[GmailEmailProvider]
        MockProv[MockEmailProvider]
        PinoLogger[PinoLogger]
    end

    Frontend --> APIRoutes
    APIRoutes --> InvoiceUCs
    APIRoutes --> ClientUCs
    WorkerEntry[Worker Cron] --> ProcessUC
    ProcessUC --> IInvoiceRepo
    ProcessUC --> IClientRepo
    ProcessUC --> IEmailProv
    InvoiceUCs --> IInvoiceRepo
    ClientUCs --> IClientRepo
    MongoClientRepo -.->|implements| IClientRepo
    MongoInvoiceRepo -.->|implements| IInvoiceRepo
    GmailProv -.->|implements| IEmailProv
    MockProv -.->|implements| IEmailProv
    PinoLogger -.->|implements| ILoggerPort
```

---

## 2. Clean Architecture — Capas y responsabilidades

### 2.1 Domain (Dominio)

**Ubicación:** `packages/domain`

Contiene las reglas de negocio puras, independientes de frameworks y bases de datos.

- **Entidades:** `Client` (id, name, email) e `Invoice` (clientId, invoiceNumber, concept, amount, dueDate, status).
- **Ports (interfaces):** `IClientRepository`, `IInvoiceRepository`, `IEmailProvider`, `ILogger`, `IInvoiceSeeder`.

**Regla de dependencia:** el dominio no importa nada de capas externas.

### 2.2 Application (Casos de uso)

**Ubicación:** `packages/application`

Orquesta la lógica de negocio aplicando el **Principio de Responsabilidad Única (SRP)**:

| Caso de uso | Responsabilidad |
|-------------|-----------------|
| `ProcessInvoiceRemindersUseCase` | Procesar recordatorios, resolver email del cliente y transicionar estados |
| `GetInvoicesSummaryUseCase` | Listar resumen de facturas con datos del cliente (join) |
| `GetInvoiceByIdUseCase` / `CreateInvoiceUseCase` / `UpdateInvoiceUseCase` / `DeleteInvoiceUseCase` | CRUD de facturas |
| `GetClientsUseCase` / `GetClientByIdUseCase` / `CreateClientUseCase` / `UpdateClientUseCase` / `DeleteClientUseCase` | CRUD de clientes |

Reciben dependencias **por inyección** (constructor), nunca instancian adaptadores concretos.

### 2.3 Infrastructure (Infraestructura)

**Ubicación:** `packages/infrastructure`

Implementaciones concretas de los ports:

- `MongoClientRepository` — persistencia de clientes en MongoDB
- `MongoInvoiceRepository` — persistencia de facturas con CRUD y aggregation `$lookup`
- `GmailEmailProvider` — envío vía SMTP (Nodemailer + Gmail)
- `MockEmailProvider` — simulación para tests y desarrollo
- `PinoLogger` — logs estructurados JSON
- `Container` — composición root (DI manual)

### 2.4 Presentation (Presentación)

**Ubicación:** `apps/api`, `apps/worker`, `apps/frontend`

- **API:** expone endpoints HTTP REST, delega a casos de uso.
- **Worker:** entrypoint cron, ejecuta el caso de uso de recordatorios.
- **Frontend:** consume la API vía proxy Next.js; gestión de clientes, facturas y emails de destino.

---

## 3. Separación API / Worker — Sistema asíncrono

### 3.1 Problema que resuelve

El envío de correos es una operación **lenta e impredecible** (latencia de red, rate limits de Gmail, reintentos). Ejecutarla en el hilo de la API REST bloquearía las peticiones HTTP y degradaría la experiencia del dashboard.

### 3.2 Solución

```mermaid
sequenceDiagram
    participant Cron as Worker Cron
    participant UC as ProcessInvoiceRemindersUseCase
    participant DB as MongoDB
    participant Gmail as Gmail SMTP
    participant API as REST API
    participant UI as Dashboard

    Note over Cron,Gmail: Proceso asíncrono (diario)
    Cron->>UC: execute()
    UC->>DB: findByStatus(primerrecordatorio, segundorecordatorio)
    loop Por cada factura
        UC->>DB: findById(clientId)
        UC->>Gmail: sendReminder(client.email)
        UC->>DB: updateStatus()
    end

    Note over API,UI: Gestión síncrona (on-demand)
    UI->>API: GET/POST/PATCH/DELETE /api/clients|invoices
    API->>DB: CRUD via use cases
    API-->>UI: JSON
```

### 3.3 Beneficios

| Aspecto | Beneficio |
|---------|-----------|
| **Resiliencia** | Fallo en envío de email no afecta la API |
| **Escalabilidad** | Worker y API escalan de forma independiente en Docker Swarm |
| **SRP** | Cada servicio tiene una única razón para cambiar |
| **Observabilidad** | Logs separados por servicio (`service: api` vs `service: worker`) |

---

## 4. Observabilidad — Logs estructurados

Utilizamos **Pino** para generar logs JSON en producción y formato legible en desarrollo (`pino-pretty`).

### 4.1 Campos estándar

```json
{
  "level": "info",
  "time": "2026-06-12T08:00:00.000Z",
  "service": "worker",
  "correlationId": "uuid-v4",
  "msg": "Invoice reminder processed",
  "invoiceId": "665a1b2c3d4e5f678901234",
  "previousStatus": "primerrecordatorio",
  "newStatus": "segundorecordatorio"
}
```

### 4.2 Estrategia

- **`correlationId`:** identifica una ejecución completa del worker o una petición HTTP. Generado en `apps/api` (middleware `request-context`) y en cada ejecución del worker (`runJob`).
- **`service`:** discrimina origen (`api`, `worker`, `seed`).
- **Niveles:** `debug` (dev), `info` (operaciones normales), `warn` (reintentos), `error` (fallos por factura sin abortar lote).
- **Agregación futura:** formato JSON compatible con ELK, Datadog o CloudWatch sin cambios de código.

---

## 5. Escalabilidad

### 5.1 Componentes stateless

- **API:** sin estado en memoria; N réplicas detrás de Traefik.
- **Worker:** idempotente por diseño (consulta DB, procesa, actualiza); múltiples réplicas requieren lock distribuido (fuera de alcance del reto; se despliega 1 réplica).

### 5.2 MongoDB como single source of truth

Toda la información de clientes y facturas vive en MongoDB. El email de destino de los recordatorios es **fuente única de verdad** en la entidad `Client`; el worker lo consulta en cada ejecución.

### 5.3 Docker Swarm

```mermaid
flowchart LR
    Traefik[Traefik Proxy]
    API1[API replica]
    API2[API replica]
    Worker[Worker x1]
    Mongo[(MongoDB)]
    Frontend[Frontend]

    Traefik --> Frontend
    Traefik --> API1
    Traefik --> API2
    API1 --> Mongo
    API2 --> Mongo
    Worker --> Mongo
```

---

## 6. Inyección de dependencias

DI **manual** mediante factory en `packages/infrastructure/src/di/container.ts`:

- Sin framework pesado (Inversify, TSyringe); suficiente para el alcance del reto.
- Cumple **Dependency Inversion Principle (DIP):** casos de uso dependen de abstracciones.
- Facilita testing: mocks inyectados en constructor.

```typescript
// Ejemplo conceptual
const container = await createContainer(config);
const apiDeps = toApiDependencies(container);
const app = createApp({ ...apiDeps, corsOrigin });
```

La API recibe `ApiDependencies` con todos los casos de uso de lectura/escritura, no el container completo — **Interface Segregation Principle (ISP)**. El worker usa el container completo incluyendo `ProcessInvoiceRemindersUseCase`.

---

## 6.1 Integridad email y estado

El worker procesa cada factura en este orden:

1. Enviar email de recordatorio
2. Actualizar estado en MongoDB

**Justificación:** no se avanza el estado si el envío de correo falla.

**Trade-off documentado:** si el email se envía correctamente pero `updateStatus` falla (p. ej. caída de DB), la factura permanece en el estado anterior y un reintento podría enviar un email duplicado. El caso de uso registra un `warn` con `emailAlreadySent: true` para facilitar la detección operativa. No se implementa outbox ni cola persistente — fuera del alcance del reto.

---

## 6.2 SOLID en el código

| Principio | Dónde se aplica |
|-----------|-----------------|
| **SRP** | Un caso de uso = una acción de negocio; routers solo enrutan HTTP; mappers solo serializan DTOs |
| **OCP** | Nuevos proveedores de email vía `IEmailProvider`; nuevos repositorios implementando ports sin cambiar casos de uso |
| **LSP** | `MockEmailProvider` y `GmailEmailProvider` son intercambiables bajo `IEmailProvider` |
| **ISP** | API depende de `ApiDependencies` (solo use cases necesarios); `InvoiceSummary` es read model enriquecido con datos del cliente |
| **DIP** | Application depende de ports en domain; `ProcessInvoiceRemindersUseCase` depende de `IClientRepository` para resolver el email actual |

### Dependencias entre paquetes

```mermaid
flowchart BT
    shared[shared enums]
    domain[domain entities ports]
    application[application use cases]
    infrastructure[infrastructure adapters]
    apps[apps api worker frontend]

    domain --> shared
    application --> domain
    application --> shared
    infrastructure --> application
    infrastructure --> domain
    infrastructure --> shared
    apps --> infrastructure
```

`domain` no importa `application` ni `infrastructure`. Los ports viven en `packages/domain`.

---

## 7. Modelo de dominio

### 7.1 Entidades y relaciones

```mermaid
erDiagram
    Client ||--o{ Invoice : has
    Client {
        string id PK
        string name
        string email
    }
    Invoice {
        string id PK
        string clientId FK
        string invoiceNumber
        string concept
        number amount
        date dueDate
        enum status
    }
```

- **`Client`:** fuente única de verdad para nombre y **email de destino** de recordatorios.
- **`Invoice`:** referencia `clientId`; incluye `invoiceNumber` (formato `INV-YYYY-NNNN`) y `concept` para identificar qué se factura.
- Al editar el email de un cliente, el worker usa el valor actual en la siguiente ejecución del cron.

### 7.2 Estados de factura

| Estado | Valor | Descripción |
|--------|-------|-------------|
| Al día | `al_dia` | Factura vigente, sin acción |
| Primer recordatorio | `primerrecordatorio` | Pendiente de envío de 1er aviso |
| Segundo recordatorio | `segundorecordatorio` | Pendiente de envío de 2do aviso |
| Desactivado | `desactivado` | Servicio desactivado tras 2do aviso |

### Transiciones (Worker)

```
primerrecordatorio  →  segundorecordatorio  (email: aviso de 2do recordatorio)
segundorecordatorio →  desactivado           (email: aviso de desactivación)
```

---

## 7.3 API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clients` | Listar clientes |
| GET | `/api/clients/:id` | Detalle de cliente |
| POST | `/api/clients` | Crear cliente |
| PATCH | `/api/clients/:id` | Actualizar nombre/email |
| DELETE | `/api/clients/:id` | Eliminar (bloqueado si tiene facturas) |
| GET | `/api/invoices` | Listar facturas con datos del cliente |
| GET | `/api/invoices/:id` | Detalle de factura |
| POST | `/api/invoices` | Crear factura (genera `invoiceNumber`) |
| PATCH | `/api/invoices/:id` | Actualizar concept, amount, dueDate, status |
| DELETE | `/api/invoices/:id` | Eliminar factura |

Errores de dominio mapeados a HTTP: validación → 400, not found → 404.

---

## 8. Integración de correo — Gmail SMTP

- **Librería:** Nodemailer
- **Transport:** `smtp.gmail.com:587` (STARTTLS)
- **Autenticación:** contraseña de aplicación de Google (requiere 2FA)
- **Alternancia:** variable `EMAIL_PROVIDER=mock|gmail`
- **Tests:** siempre `MockEmailProvider` (sin red)

---

## 9. Estructura del monorepo

```
monolegal-challenge/
├── packages/
│   ├── shared/           # Enums y tipos compartidos (shared kernel)
│   ├── domain/           # Entidades, errores de dominio y ports
│   ├── application/      # Casos de uso + tests Jest
│   └── infrastructure/   # Adaptadores + DI container
├── apps/
│   ├── api/              # REST API (Express)
│   ├── worker/           # Cron job
│   └── frontend/         # Next.js dashboard
├── scripts/              # Seed de datos
├── docker/               # Dockerfiles multi-stage
├── docker-compose.yml    # Swarm + Traefik
├── ARCHITECTURE.md
└── DEPLOYMENT.md
```

---

## 10. Decisiones técnicas registradas

| Decisión | Alternativa descartada | Justificación |
|----------|------------------------|---------------|
| Monorepo (npm) | Multi-repo | Desarrollo coordinado, tipos compartidos |
| Express | Fastify/NestJS | Simplicidad; CRUD REST sin sobre-ingeniería |
| Mongoose | Driver nativo | Schema validation, índices declarativos |
| DI manual | Inversify | Menor complejidad, mismo beneficio SOLID |
| Gmail SMTP | SendGrid/Resend | Requerimiento del equipo (cuenta Gmail propia) |
| Pino | Winston | Mejor rendimiento, JSON nativo |
| node-cron | Bull/BullMQ | No se requiere cola persistente para cron diario |

---

## 11. Seguridad (consideraciones)

- Credenciales Gmail solo en variables de entorno, nunca en código.
- API REST sin autenticación (entorno interno/demo); CORS restringido al dominio del frontend.
- Contenedores Docker con usuario no-root.
- Tras cambios de schema, ejecutar `npm run seed` para reinicializar datos de demo.

---

*Documento actualizado — sistema de gestión de facturación con entidad Client, CRUD completo y tests unitarios.*
