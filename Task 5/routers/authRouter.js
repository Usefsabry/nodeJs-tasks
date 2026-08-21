const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
} = require('../middlewares/validationMiddleware');
const { protect } = require('../middlewares/authMiddleware');

// Public Authentication Routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected Authentication Routes
router.get('/me', protect, getMe);

module.exports = router;
