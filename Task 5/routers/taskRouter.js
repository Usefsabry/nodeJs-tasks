const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  addCollaborators,
  removeCollaborator,
} = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
  validateCollaborators,
} = require('../middlewares/validationMiddleware');
const { protect } = require('../middlewares/authMiddleware');

// All task routes require authentication
router.use(protect);

// Standard CRUD routes
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', validateCreateTask, createTask);
router.put('/:id', validateUpdateTask, updateTask);
router.delete('/:id', deleteTask);

// Specific Task Management routes (Assignment & Collaborators)
router.patch('/:id/assign', validateAssignTask, assignTask);
router.patch('/:id/collaborators', validateCollaborators, addCollaborators);
router.delete('/:id/collaborators/:userId', removeCollaborator);

module.exports = router;
