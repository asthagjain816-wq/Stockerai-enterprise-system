// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    err = {
      statusCode: 400,
      message: `Validation Error: ${message}`,
    };
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = {
      statusCode: 409,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    };
  }

  // JWT Token Errors
  if (err.name === 'JsonWebTokenError') {
    err = {
      statusCode: 401,
      message: 'Invalid token, please try again later',
    };
  }

  if (err.name === 'TokenExpiredError') {
    err = {
      statusCode: 401,
      message: 'Token has expired, please login again',
    };
  }

  // Cast Error (Invalid ID)
  if (err.name === 'CastError') {
    err = {
      statusCode: 400,
      message: `Invalid ${err.path}: ${err.value}`,
    };
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
