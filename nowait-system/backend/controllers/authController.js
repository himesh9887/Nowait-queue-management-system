const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

function normalizeUsername(value) {
  return value?.trim()?.toLowerCase();
}

function toDisplayName(username) {
  if (!username) {
    return "NoWait User";
  }

  return username
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildSessionUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}

function signSessionToken(sessionUser) {
  return jwt.sign(
    {
      sub: sessionUser.id,
      username: sessionUser.username,
      displayName: sessionUser.displayName,
      role: sessionUser.role,
    },
    process.env.JWT_SECRET || "development-secret",
    {
      expiresIn: "12h",
    },
  );
}

async function register(req, res, next) {
  try {
    const username = normalizeUsername(req.body?.username);
    const password = req.body?.password;
    const role = req.body?.role;

    if (!username || !password || !role) {
      return res.status(400).json({
        message: "Username, password, and role are required.",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Please select a valid role.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await User.findOne({
      username,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "That username is already in use.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      displayName: toDisplayName(username),
      role,
      passwordHash,
      active: true,
    });

    return res.status(201).json({
      message: "Account created successfully. You can sign in now.",
      user: buildSessionUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const username = normalizeUsername(req.body?.username);
    const password = req.body?.password;
    const role = req.body?.role;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    if (role && !["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Please choose a valid login role.",
      });
    }

    const user = await User.findOne({
      username,
      active: true,
    }).select("+passwordHash");

    if (!user || (role && user.role !== role)) {
      return res.status(401).json({
        message: role ? `Invalid ${role} credentials.` : "Invalid credentials.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: role ? `Invalid ${role} credentials.` : "Invalid credentials.",
      });
    }

    const sessionUser = buildSessionUser(user);
    const token = signSessionToken(sessionUser);

    return res.status(200).json({
      token,
      user: sessionUser,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCurrentUser(req, res) {
  return res.status(200).json({
    user: req.user,
  });
}

module.exports = {
  getCurrentUser,
  login,
  register,
};
