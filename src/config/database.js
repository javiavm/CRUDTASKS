const { Pool } = require('pg');
const logger = require('./logger');

//conexiones a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tasksdb',
  user: process.env.DB_USER || 'taskuser',
  password: process.env.DB_PASSWORD || 'taskpassword',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info('Conexión exitosa a PostgreSQL');
});

pool.on('error', (err) => {
  logger.error('ERROR inesperado en PostgreSQL:', err);
  process.exit(-1);
});

const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Crear tabla de tareas si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    logger.info('Tabla "tasks" verificada o creada correctamente');
  } catch (error) {
    logger.error('ERROR al inicializar la base de datos:', error);
    throw error;
  } finally {
    client.release();
  }
};

const waitForDatabase = async (maxRetries = 30, retryDelay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.query('SELECT 1');
      logger.info('Base de datos lista y accesible');
      return true;
    } catch (error) {
      logger.warn(`Esperando a que la base de datos esté lista... Intento ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  throw new Error('No se pudo conectar a la base de datos después de múltiples intentos');
};

module.exports = {
  pool,
  initDatabase,
  waitForDatabase
};
