const client = require('prom-client');
const logger = require('./logger');

const register = new client.Registry();

// Métricas por defecto del sistema (CPU, memoria, etc..)
client.collectDefaultMetrics({
  register,
  prefix: 'tasks_api_'
});

const httpRequestCounter = new client.Counter({
  name: 'tasks_api_http_requests_total',
  help: 'Total de peticiones HTTP recibidas',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'tasks_api_http_request_duration_seconds',
  help: 'Duración de las peticiones HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const tasksCreatedCounter = new client.Counter({
  name: 'tasks_api_tasks_created_total',
  help: 'Total de tareas creadas',
  registers: [register]
});

const tasksCompletedCounter = new client.Counter({
  name: 'tasks_api_tasks_completed_total',
  help: 'Total de tareas completadas',
  registers: [register]
});

const activeTasksGauge = new client.Gauge({
  name: 'tasks_api_active_tasks',
  help: 'Número actual de tareas activas (no completadas)',
  registers: [register]
});

const dbErrorCounter = new client.Counter({
  name: 'tasks_api_db_errors_total',
  help: 'Total de errores de base de datos',
  registers: [register]
});

logger.info('Métricas de Prometheus configuradas correctamente');

module.exports = {
  register,
  httpRequestCounter,
  httpRequestDuration,
  tasksCreatedCounter,
  tasksCompletedCounter,
  activeTasksGauge,
  dbErrorCounter
};
