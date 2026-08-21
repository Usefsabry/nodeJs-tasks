const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const {
  validateCreateUser,
  validateUpdateUser,
} = require('../middlewares/validationMiddleware');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// All user routes require authentication
router.use(protect);

// Admin-only user management routes
router.get('/', restrictTo('admin'), getAllUsers);
router.post('/', restrictTo('admin'), validateCreateUser, createUser);
router.delete('/:id', restrictTo('admin'), deleteUser);

// Self or Admin accessible routes
router.get('/:id', getUserById);
router.put('/:id', validateUpdateUser, updateUser);

module.exports = router;
