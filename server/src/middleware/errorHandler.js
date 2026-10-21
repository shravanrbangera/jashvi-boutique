const { config } = require('../config/env');

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Log error server-side
  console.error(`[API Error] ${req.method} ${req.originalUrl} - Status: ${statusCode}`, err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid session token.',
    });
  }

  // Default response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
