const User = require('../models/userModel');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/jwtUtils');

/**
 * 1. Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user with this email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('A user with this email already exists', 400));
  }

  // Create new user (password is hashed automatically by pre-save hook)
  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });

  // Generate authentication token
  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    data: newUser,
  });
});

/**
 * 2. Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Verify password using bcrypt comparison method
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Generate authentication token
  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    data: user,
  });
});

/**
 * 3. Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('assignedTasks')
    .populate('collaboratedTasks');

  res.status(200).json({
    success: true,
    data: user,
  });
});

module.exports = {
  register,
  login,
  getMe,
};
