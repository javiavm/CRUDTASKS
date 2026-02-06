//aplicación
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const logger = require('./config/logger');
const { waitForDatabase, initDatabase } = require('./config/database');
const { register } = require('./config/metrics');
const taskRoutes = require('./routes/taskRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const metricsMiddleware = require('./middlewares/metricsMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(metricsMiddleware);

app.use('/', healthRoutes); 
app.use('/api/tasks', taskRoutes); 
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Error al generar métricas:', error);
    res.status(500).end(error.message);
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'API GESTORA DE TAREAS',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tasks: '/api/tasks',
      metrics: '/metrics'
    },
    documentation: 'Ver README.md para más información'
  });
});

// Middlewares DE ERROR
app.use(notFound); 
app.use(errorHandler); 

//iniciar el servidor
const startServer = async () => {
  try {
    logger.info('Iniciando aplicación...');
    logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);

    logger.info('Esperando conexión con la base de datos.....');
    await waitForDatabase();
    logger.info('Inicializando base de datos...');
    await initDatabase();
    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en puerto ${PORT}`);
      logger.info(`Health check disponible en: http://localhost:${PORT}/health`);
      logger.info(`Métricas disponibles en: http://localhost:${PORT}/metrics`);
      logger.info(`API de tareas disponible en: http://localhost:${PORT}/api/tasks`);
    });
  } catch (error) {
    logger.error('ERROR al iniciar el servidor:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

startServer();
