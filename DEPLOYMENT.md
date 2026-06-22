# Guía de Despliegue — Monolegal Challenge

Pasos exactos para que el equipo técnico de Monolegal levante la infraestructura, ejecute pruebas y visualice el proyecto.

---

## 1. Prerrequisitos

| Herramienta    | Versión mínima | Verificación             |
| -------------- | -------------- | ------------------------ |
| Docker         | 24+            | `docker --version`       |
| Docker Compose | v2+            | `docker compose version` |
| .NET SDK       | 8.0            | `dotnet --version`       |
| Node.js        | 20 LTS         | `node --version`         |
| npm            | 10+            | `npm --version`          |
| Git            | 2+             | `git --version`          |

Para despliegue con Swarm, el nodo manager debe tener Docker Swarm inicializado.

---

## 2. Configuración Gmail (contraseña de aplicación)

1. Acceder a [Google Account → Seguridad](https://myaccount.google.com/security)
2. Activar **Verificación en 2 pasos** (obligatorio)
3. Ir a **Contraseñas de aplicaciones**
4. Crear una contraseña para "Correo" / "Otro (Monolegal)"
5. Copiar la contraseña generada (formato `xxxx xxxx xxxx xxxx`)

---

## 3. Variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/monolegal
EMAIL_PROVIDER=gmail
GMAIL_USER=tu@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
API_PORT=4000
CORS_ORIGIN=http://localhost:3000
CRON_SCHEDULE=0 8 * * *
RUN_ON_START=true
API_URL=http://localhost:4000
```

> Para desarrollo sin enviar correos reales, usar `EMAIL_PROVIDER=mock`.
>
> `API_URL` es una variable de **runtime** usada por el proxy del frontend (`/api/invoices`). En Docker/Portainer el valor por defecto es `http://api:4000` (red interna del stack).

---

## 4. Desarrollo local (sin Docker)

### 4.1 Instalar dependencias

```bash
npm install
```

### 4.2 Compilar

```bash
npm run build
```

Compila la solución .NET (`backend/dotnet/`) y el frontend Next.js.

### 4.3 Levantar MongoDB

```bash
docker run -d --name monolegal-mongo -p 27017:27017 mongo:7
```

### 4.4 Ejecutar seed

```bash
npm run seed
```

Salida esperada:

```
Seed completed: 3 clients, 15 invoices inserted.
Status distribution: { al_dia: 4, primerrecordatorio: 4, segundorecordatorio: 4, desactivado: 3 }
```

### 4.5 Iniciar servicios

Terminal 1 — API:

```bash
npm run dev:api
```

Terminal 2 — Worker:

```bash
npm run dev:worker
```

Terminal 3 — Frontend:

```bash
npm run dev:frontend
```

### 4.6 Verificar

| Recurso      | URL                                |
| ------------ | ---------------------------------- |
| Dashboard    | http://localhost:3000              |
| API Health   | http://localhost:4000/health       |
| API Facturas | http://localhost:4000/api/invoices |

---

## 5. Ejecutar pruebas

```bash
npm test
```

Ejecuta `dotnet test` en `backend/dotnet/`. Los tests usan mocks — no requieren MongoDB ni Gmail en CI.

Cobertura (opcional):

```bash
dotnet test backend/dotnet/Monolegal.sln --collect:"XPlat Code Coverage"
```

---

## 6. Despliegue con Docker Swarm

### 6.1 Inicializar Swarm (solo primera vez)

```bash
docker swarm init
```

### 6.2 Crear archivo de secretos (opcional, recomendado)

```bash
echo "tu@gmail.com" | docker secret create gmail_user -
echo "xxxx-xxxx-xxxx-xxxx" | docker secret create gmail_app_password -
```

### 6.3 Construir imágenes

```bash
docker compose build
```

### 6.4 Desplegar stack

```bash
docker stack deploy -c docker-compose.yml monolegal
```

#### Despliegue con Portainer

Al crear o editar el stack en Portainer, definir las variables en la sección **Environment variables** (al final del editor). Portainer **no** lee el `.env` de tu máquina local.

```env
API_URL=http://api:4000
EMAIL_PROVIDER=gmail
GMAIL_USER=tu@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
CRON_SCHEDULE=0 8 * * *
RUN_ON_START=false
```

`API_URL` se lee en **runtime** por el servicio `frontend` (proxy server-side hacia la API). No requiere rebuild al cambiar la URL; basta con redeployar el servicio frontend.

Si la API está fuera del stack, apunta `API_URL` a la URL accesible desde la red del contenedor frontend.

Verificar servicios:

```bash
docker stack services monolegal
docker stack ps monolegal
```

### 6.5 Ejecutar seed en el stack

```bash
docker run --rm --network monolegal_monolegal-net \
  -e MONGODB_URI=mongodb://mongodb:27017/monolegal \
  -v $(pwd)/backend/dotnet:/src -w /src \
  mcr.microsoft.com/dotnet/sdk:8.0 \
  dotnet run --project src/Monolegal.Seed
```

Alternativa local antes del deploy:

```bash
MONGODB_URI=mongodb://localhost:27017/monolegal npm run seed
```

### 6.6 Acceder a la aplicación

| Servicio          | URL                                     |
| ----------------- | --------------------------------------- |
| Dashboard         | http://monolegal.local                  |
| API               | http://api.monolegal.local/api/invoices |
| Traefik Dashboard | http://localhost:8080                   |

---

## 7. Probar el Worker manualmente

Con `RUN_ON_START=true` en el worker, al iniciar procesará facturas inmediatamente.

Ver logs:

```bash
docker service logs -f monolegal_worker
```

Buscar en logs:

- `Worker job started`
- `Mock email sent` o `Email sent via Gmail SMTP`
- `Invoice reminder sent and status updated`

---

## 8. Troubleshooting

### npm install falla con error de symlink (Windows)

El monorepo no usa `workspaces` de npm (que exigen symlinks). Las dependencias internas usan rutas `file:` y el `.npmrc` raíz incluye `install-links=true`, que indica a npm **copiar** esos paquetes en lugar de crear symlinks (en npm, `install-links=false` es el valor por defecto y justamente intenta enlazar).

Con esa configuración, `npm install` debería funcionar sin **Modo de desarrollador**.

Si aún falla:

1. Cierra editores o procesos que bloqueen `node_modules` (antivirus, indexación).
2. Borra `node_modules` y reintenta:

```bash
rmdir /s /q node_modules
npm install
```

3. O ejecuta el script de Windows:

```bash
scripts\setup-windows.cmd
```

4. Como último recurso, activa **Modo de desarrollador** (Configuración → Privacidad y seguridad → Para desarrolladores) para permitir junctions.

Para desarrollo local completo sin instalar en Windows, se recomienda **Docker** (ver sección 6).

### API no responde

```bash
docker service logs monolegal_api
curl http://api.monolegal.local/health
```

### Frontend no carga datos

- Verificar que el servicio `frontend` tiene `API_URL` configurado (por defecto `http://api:4000` en el stack)
- Comprobar que el proxy responde: `curl http://monolegal.local/api/invoices` (o la URL pública del frontend)
- Revisar logs del frontend: `docker service logs monolegal_frontend`
- Verificar CORS: `CORS_ORIGIN=http://monolegal.local` (solo aplica si el navegador llama directo a la API)
- Revisar consola del navegador (F12 → Network)

### Gmail rechaza autenticación

- Confirmar 2FA activo en la cuenta Google
- Usar contraseña de aplicación, **no** la contraseña normal
- Verificar `GMAIL_USER` coincide con la cuenta que generó la app password

### MongoDB connection refused

```bash
docker service ps monolegal_mongodb
docker service logs monolegal_mongodb
```

### Traefik no enruta

```bash
docker service logs monolegal_traefik
# Verificar labels en docker-compose.yml
# Confirmar entradas en /etc/hosts
```

### Eliminar stack completo

```bash
docker stack rm monolegal
docker volume rm monolegal_mongo-data  # si se desea limpiar datos
```

---

## 9. Checklist de entrega

- [ ] `npm install && npm run build` compila backend .NET y frontend
- [ ] `npm test` — todos los tests .NET pasan
- [ ] `npm run seed` — 15 facturas en 3 clientes
- [ ] Dashboard en http://localhost:3000 muestra KPIs y tabla
- [ ] Worker procesa recordatorios (logs visibles)
- [ ] `docker stack deploy` levanta todos los servicios
- [ ] Traefik enruta frontend y API por hostname
- [ ] Gmail envía correos (con `EMAIL_PROVIDER=gmail`)

---

_Documento generado como parte del Hito 5 — Reto del Arquitecto Monolegal._
