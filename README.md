# CRUD de Tareas - Prueba Técnica

API REST para gestión de tareas con Node.js, PostgreSQL, Docker, Nginx, Prometheus y Grafana, etc, etc

---

## Requisitos

Instala esto para compilar en local:

- **Docker** (versión 20.10 o +++)
- **Docker Compose** (version 2.0 o +++)
- **Git**

---

## Como levantar el proyecto

### 1. clonar el repo

```bash
git clone <repo>
cd Prueba
```

### 2. Configurar variables de entorno

Crea el archivo .env

```bash
# En Windows
Copy-Item .env.example .env

# En Linux o gitbash
cp .env.example .env
```

Modifica el .env de acuerdo a lo que se vaya a incluir

### 3. Para levantar los servicios

Valida que tengas instalado el npm y sino ejecuta

```bash
npm install
```

## Despues todo se ejecuta con un solo comando a traves de

```bash
docker-compose up -d --build
```

y ya se valida que funciona con http://localhost/health

Validamos que todo corre bien ejecutando:

```bash
docker-compose ps
```

Deberías ver 5 contenedores en estado "Up":
1. `tasks-api` (API Backend)
2. `tasks-database` (PostgreSQL)
3. `tasks-nginx` (Reverse Proxy)
4. `tasks-prometheus` (Métricas)
5. `tasks-grafana` (Visualización)


---

## Acceso a los Servicios

Una vez que los contenedores esten activos, puedes acceder con estas rutas:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **API con nginx** | http://localhost | API principal a través del reverse proxy |
| **API Directa** | http://localhost:3000 | API sin proxy |
| **Health Check** | http://localhost/health | Estado de salud de la API |
| **Métricas** | http://localhost/metrics | Métricas de Prometheus |
| **Prometheus** | http://localhost:9090 | Interface de Prometheus |
| **Grafana** | http://localhost:3001 | Dashboards de visualización |
| **PostgreSQL** | localhost:5432 | DB |

### Credenciales de Grafana

- **Usuario**: `admin`
- **Contraseña**: `admin`

---

## Para detener todos los servicios

```bash
# Para detener todos los servicios:
docker-compose down

# Para detener y eliminar volúmenes:
docker-compose down -v
```

### Reconstruir todo desde cero

```bash
# Detener todo, eliminar volúmenes e imágenes
docker-compose down -v
docker system prune -a

# Reconstruir y levantar
docker-compose up -d --build
```

### Si la API no inicia, ejecuta lo siguiente

```bash
# Ver logs de la API
docker-compose logs -f api

# Verificar que PostgreSQL está listo
docker-compose logs database

# Reiniciar solo la API
docker-compose restart api
```


---

## ARQUITECTURA (Hice lo mas rapido posible)

```plaintext
CLIENTE
       │
       ▼
┌─────────────────┐
│   HTTP:80       │
└────────┬────────┘
         │
         │
         ▼
┌─────────────────┐
│     nginx       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    HTTP :3000   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API NODE JS    │
└────────┬────────┘
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│   SQL   │ │  Metrics│→│PROMETHEU│
└─────────┘ └─────────┘ └─────────┘
    │                        │
    ▼                        ▼
   DB                     Grafana
```

---

## DECISIONES TECNICAS PROPIAS

### Arquitectura MVC

**¿Por qué?**
- Es la estructura que debe seguir un MVP finalizado para produccion
- Facilita el testing y mantenimiento
- Escalable y organizado

**Estructura:**

```
src/
├── config/         # Configuración (DB, Logger, Métricas,etc)
├── models/         # Modelos de datos o las tasks
├── controllers/    # Lógica de negocio
├── routes/         # Definimos los endpoints
├── middlewares/    # Middlewares (errores, métricas)
└── index.js        # archivo principal
```

### Dockerfile Multi-Stage

- Imagen final más liviana
- Separación de build y runtime
- Mejor seguridad

### Usuario No Root

El contenedor de la API corre con usuario nodejs (UID 1001), no con root.

---

## Ejemplos de uso con cURL

```bash
# Health check
curl http://localhost/health

# Crear una tarea
curl -X POST http://localhost/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Mi primera tarea","description":"prueba local jvm"}'

# Obtener todas las tareas
curl http://localhost/api/tasks

# Obtener una tarea específica
curl http://localhost/api/tasks/1

# Actualizar una tarea
curl -X PUT http://localhost/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Eliminar una tarea
curl -X DELETE http://localhost/api/tasks/1

# Ver estadísticas
curl http://localhost/api/tasks/stats

# Ver métricas
curl http://localhost/metrics
```

---

## Autor

**Javier Vidal Miguel**

**Prueba Técnica - CRUD de Tareas**

Fecha: 05 de Febrero de 2026
