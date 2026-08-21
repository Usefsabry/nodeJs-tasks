const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// 1. Get all users (Admin only)
const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()
    .populate('assignedTasks')
    .populate('collaboratedTasks');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// 2. Get user by ID (Admin or own profile)
const getUserById = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return next(
      new AppError('You do not have permission to view another user profile', 403)
    );
  }

  const user = await User.findById(req.params.id)
    .populate('assignedTasks')
    .populate('collaboratedTasks');

  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// 3. Create a new user (Admin)
const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('A user with this email already exists', 400));
  }

  const newUser = await User.create({ name, email, password, role });
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser,
  });
});

// 4. Update user by ID (Admin or own profile)
const updateUser = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return next(
      new AppError('You do not have permission to update another user profile', 403)
    );
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const { name, email, password, role } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password; // pre-save hook will hash if modified
  if (role && req.user && req.user.role === 'admin') {
    user.role = role;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

// 5. Delete user by ID (Admin only)
const deleteUser = asyncHandler(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
