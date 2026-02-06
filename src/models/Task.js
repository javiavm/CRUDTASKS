const { pool } = require('../config/database');
const logger = require('../config/logger');
const { dbErrorCounter } = require('../config/metrics');

class Task {
  static async getAll() {
    try {
      const result = await pool.query(
        'SELECT * FROM tasks ORDER BY created_at DESC'
      );
      logger.debug(`Se obtuvieron ${result.rows.length} tareas`);
      return result.rows;
    } catch (error) {
      dbErrorCounter.inc();
      logger.error('Error al obtener tareas:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1',
        [id]
      );
      logger.debug(`Tarea con ID ${id} obtenida`);
      return result.rows[0];
    } catch (error) {
      dbErrorCounter.inc();
      logger.error(`Error al obtener tarea con ID ${id}:`, error);
      throw error;
    }
  }

  static async create(taskData) {
    const { title, description } = taskData;
    try {
      const result = await pool.query(
        `INSERT INTO tasks (title, description, completed)
         VALUES ($1, $2, FALSE)
         RETURNING *`,
        [title, description]
      );
      logger.info(`Nueva tarea creada con ID ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      dbErrorCounter.inc();
      logger.error('Error al crear tarea:', error);
      throw error;
    }
  }

  static async update(id, taskData) {
    const { title, description, completed } = taskData;
    try {
      const result = await pool.query(
        `UPDATE tasks
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             completed = COALESCE($3, completed),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [title, description, completed, id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      logger.info(`Tarea con ID ${id} actualizada`);
      return result.rows[0];
    } catch (error) {
      dbErrorCounter.inc();
      logger.error(`Error al actualizar tarea con ID ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      logger.info(`Tarea con ID ${id} eliminada`);
      return result.rows[0];
    } catch (error) {
      dbErrorCounter.inc();
      logger.error(`Error al eliminar tarea con ID ${id}:`, error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE completed = TRUE) as completed,
          COUNT(*) FILTER (WHERE completed = FALSE) as pending
        FROM tasks
      `);
      return result.rows[0];
    } catch (error) {
      dbErrorCounter.inc();
      logger.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

module.exports = Task;
