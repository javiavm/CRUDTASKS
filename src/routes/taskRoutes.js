const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');

// Rutas del CRUD
router.get('/stats', getTaskStats);      // Obtener estadísticas
router.get('/', getAllTasks);            // Obtener todas las tareas
router.get('/:id', getTaskById);         // Obtener una tarea por ID
router.post('/', createTask);            // Crear una nueva tarea
router.put('/:id', updateTask);          // Actualizar una tarea
router.delete('/:id', deleteTask);       // Eliminar una tarea

module.exports = router;
