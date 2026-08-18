const express = require('express');
const healthRouter = require('./routes/health');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', healthRouter);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
