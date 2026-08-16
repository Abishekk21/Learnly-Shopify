export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    
    // Special handling for enrollment duplicates
    if (field === 'store' || err.keyPattern.student) {
      return res.status(400).json({
        error: 'Duplicate enrollment',
        message: 'This student is already enrolled in this course.'
      });
    }
    
    return res.status(400).json({
      error: 'Duplicate entry',
      message: `A record with this ${field} already exists.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation failed',
      message: messages.join(', ')
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'The provided ID is not valid.'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    message: 'An unexpected error occurred. Please try again.'
  });
};
