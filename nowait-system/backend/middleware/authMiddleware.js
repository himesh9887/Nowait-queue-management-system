const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Admin authorization is required.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "development-secret",
    );

    req.admin = decoded;
    return next();
  } catch (_error) {
    return res.status(401).json({
      message: "Your admin session has expired. Please sign in again.",
    });
  }
}

module.exports = {
  requireAdmin,
};
