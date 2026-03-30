const jwt = require("jsonwebtoken");

const User = require("../models/User");

function getTokenFromRequest(req) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  return scheme === "Bearer" ? token : null;
}

async function resolveUserFromToken(token) {
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || "development-secret",
  );
  const user = await User.findOne({
    _id: decoded.sub,
    active: true,
  });

  if (!user) {
    const error = new Error("Your account could not be verified.");
    error.statusCode = 401;
    throw error;
  }

  return {
    id: user._id.toString(),
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}

async function authenticate(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      message: "Authentication is required.",
    });
  }

  try {
    req.user = await resolveUserFromToken(token);
    return next();
  } catch (_error) {
    return res.status(401).json({
      message: "Your session has expired. Please sign in again.",
    });
  }
}

async function optionalAuth(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return next();
  }

  try {
    req.user = await resolveUserFromToken(token);
  } catch (_error) {
    return res.status(401).json({
      message: "Your session has expired. Please sign in again.",
    });
  }

  return next();
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have access to this action.",
      });
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
  optionalAuth,
};
