// Controlador de Tareas
const Task = require('../models/Task');
const logger = require('../config/logger');
const { tasksCreatedCounter, tasksCompletedCounter, activeTasksGauge } = require('../config/metrics');

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.getAll();

    logger.info('Lista de tareas obtenida correctamente');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.getById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    logger.info(`Tarea ${id} obtenida correctamente`);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El título es requerido'
      });
    }

    const newTask = await Task.create({ title, description });

    tasksCreatedCounter.inc();
    await updateActiveTasksGauge();

    logger.info(`Tarea creada: ${newTask.id} - ${newTask.title}`);

    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const updatedTask = await Task.update(id, { title, description, completed });

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    if (completed === true) {
      tasksCompletedCounter.inc();
    }

    await updateActiveTasksGauge();

    logger.info(`Tarea actualizada: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.delete(id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    await updateActiveTasksGauge();

    logger.info(`Tarea eliminada: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Tarea eliminada exitosamente',
      data: deletedTask
    });
  } catch (error) {
    next(error);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const updateActiveTasksGauge = async () => {
  try {
    const stats = await Task.getStats();
    activeTasksGauge.set(parseInt(stats.pending));
  } catch (error) {
    logger.error('Error al actualizar gauge de tareas activas:', error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};
