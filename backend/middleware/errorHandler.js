function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error('Server Error:', error);
  res.status(error.statusCode || 500).json({
    message: error.message || 'Internal server error'
  });
}

module.exports = errorHandler;
