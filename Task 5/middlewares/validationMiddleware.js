const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Middleware to check validation results
const checkValidationResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format error messages
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  next();
};

// Auth Validation Rules
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('User name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .trim()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  checkValidationResults,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  checkValidationResults,
];

// User Validation Rules
const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('User name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .trim()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  checkValidationResults,
];

const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('User name cannot be empty'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .trim()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  checkValidationResults,
];

// Task Validation Rules
const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .trim()
    .isIn(['created', 'in progress', 'done'])
    .withMessage('Status must be: created, in progress, or done'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Priority must be an integer between 1 and 10'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('dueDate must be a valid ISO8601 date'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('assignedTo must be a valid MongoDB ObjectId'),
  body('collaborators')
    .optional()
    .isArray()
    .withMessage('collaborators must be an array of ObjectIds'),
  body('collaborators.*')
    .optional()
    .isMongoId()
    .withMessage('Each collaborator must be a valid MongoDB ObjectId'),
  checkValidationResults,
];

const validateUpdateTask = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .trim()
    .isIn(['created', 'in progress', 'done'])
    .withMessage('Status must be: created, in progress, or done'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Priority must be an integer between 1 and 10'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('dueDate must be a valid ISO8601 date'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('assignedTo must be a valid MongoDB ObjectId'),
  body('collaborators')
    .optional()
    .isArray()
    .withMessage('collaborators must be an array of ObjectIds'),
  body('collaborators.*')
    .optional()
    .isMongoId()
    .withMessage('Each collaborator must be a valid MongoDB ObjectId'),
  checkValidationResults,
];

// Task Assignment Validation
const validateAssignTask = [
  body('assignedTo')
    .notEmpty()
    .withMessage('assignedTo user ID is required')
    .isMongoId()
    .withMessage('assignedTo must be a valid MongoDB ObjectId'),
  checkValidationResults,
];

// Task Collaborators Validation
const validateCollaborators = [
  body('collaborators')
    .isArray({ min: 1 })
    .withMessage('collaborators must be a non-empty array of ObjectIds'),
  body('collaborators.*')
    .isMongoId()
    .withMessage('Each collaborator must be a valid MongoDB ObjectId'),
  checkValidationResults,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
  validateCollaborators,
};
