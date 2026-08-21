const AppError = require('../utils/appError');

// Helper to handle CastError (Invalid ObjectIds)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Helper to handle Duplicate Key errors
const handleDuplicateFieldsDB = (err) => {
  if (err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists. Please use another value!`;
    return new AppError(message, 400);
  }
  return new AppError('Duplicate field value entered. Please use another value!', 400);
};

// Helper to handle ValidationError from Mongoose
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Helper to handle JWT signature verification errors
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};

// Helper to handle JWT expiration errors
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please log in again.', 401);
};

// Handle 404 Not Found
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

// Centralized Global Error Handler
const errorHandler = (err, req, res, next) => {
  // Setup defaults
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Log error console message in development/tests
  if (process.env.NODE_ENV !== 'test') {
    console.error('API Error details:', err);
  }

  // Mongoose / Database error translation
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
