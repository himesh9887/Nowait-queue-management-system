function notFoundHandler(req, res) {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;

  console.error(error);

  return res.status(statusCode).json({
    message:
      error.message || "Something went wrong while processing the request.",
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
