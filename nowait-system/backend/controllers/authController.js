const jwt = require("jsonwebtoken");

function buildAdminPayload(username) {
  return {
    username,
    role: "admin",
  };
}

async function loginAdmin(req, res, next) {
  try {
    const username = req.body?.username?.trim();
    const password = req.body?.password;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        message: "Invalid admin credentials.",
      });
    }

    const token = jwt.sign(
      buildAdminPayload(username),
      process.env.JWT_SECRET || "development-secret",
      {
        expiresIn: "12h",
      },
    );

    return res.status(200).json({
      token,
      admin: buildAdminPayload(username),
    });
  } catch (error) {
    return next(error);
  }
}

async function getCurrentAdmin(req, res) {
  return res.status(200).json({
    admin: req.admin,
  });
}

module.exports = {
  getCurrentAdmin,
  loginAdmin,
};
