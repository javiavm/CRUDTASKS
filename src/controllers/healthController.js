// Controlador de Health Check
const { pool } = require('../config/database');
const logger = require('../config/logger');

// Health check endpoint
const healthCheck = async (req, res) => {
  try {
    await pool.query('SELECT 1');

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    };

    logger.debug('Health check exitoso');

    res.status(200).json(healthStatus);
  } catch (error) {
    logger.error('Health check falló:', error);

    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: error.message
    };

    res.status(503).json(healthStatus);
  }
};

const readinessCheck = async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
};

const livenessCheck = (req, res) => {
  res.status(200).json({ alive: true });
};

module.exports = {
  healthCheck,
  readinessCheck,
  livenessCheck
};
