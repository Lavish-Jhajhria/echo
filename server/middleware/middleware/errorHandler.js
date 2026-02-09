// Error handler

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';

    const validationErrors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message
    }));

    return res.status(statusCode).json({
      success: false,
      error: message,
      details: validationErrors
    });
  }

  // Handle bad ObjectId values
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid resource identifier';
  }

  // Final JSON error response
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = errorHandler;

