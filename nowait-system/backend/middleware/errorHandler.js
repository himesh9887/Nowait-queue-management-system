function buildDuplicateKeyMessage(error) {
  const fieldName = Object.keys(error?.keyPattern || error?.keyValue || {})[0];

  if (!fieldName) {
    return "A record with the same value already exists.";
  }

  if (fieldName === "username") {
    return "That username is already in use.";
  }

  if (fieldName === "tokenNumber") {
    return "That token number has already been assigned for the selected day.";
  }

  return `${fieldName} already exists.`;
}

function buildValidationMessage(error) {
  const validationErrors = Object.values(error?.errors || {});

  if (!validationErrors.length) {
    return "One or more fields are invalid.";
  }

  return validationErrors
    .map((entry) => entry.message)
    .filter(Boolean)
    .join(" ");
}

function notFoundHandler(req, res) {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message =
    error.message || "Something went wrong while processing the request.";

  if (error?.code === 11000) {
    statusCode = 409;
    message = buildDuplicateKeyMessage(error);
  } else if (error?.name === "ValidationError") {
    statusCode = 400;
    message = buildValidationMessage(error);
  } else if (error?.name === "CastError") {
    statusCode = 400;
    message = `Invalid value supplied for ${error.path}.`;
  }

  console.error(error);

  return res.status(statusCode).json({
    message,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
