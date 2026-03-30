const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])?$/;
const MIN_PASSWORD_LENGTH = 8;

function normalizeBodyValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUsername(value) {
  return normalizeBodyValue(value).toLowerCase();
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

function validateUsername(username) {
  if (!username) {
    return "Username is required.";
  }

  if (username.length < 3 || username.length > 32) {
    return "Username must be between 3 and 32 characters long.";
  }

  if (!USERNAME_PATTERN.test(username)) {
    return "Username can use lowercase letters, numbers, periods, underscores, and hyphens only.";
  }

  return "";
}

function validatePassword(password) {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }

  if (!/[a-z]/i.test(password) || !/\d/.test(password)) {
    return "Password must include at least one letter and one number.";
  }

  return "";
}

async function register(req, res, next) {
  try {
    const username = normalizeUsername(req.body?.username);
    const password = normalizeBodyValue(req.body?.password);
    const requestedRole = normalizeBodyValue(req.body?.role).toLowerCase();
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (requestedRole && requestedRole !== "user") {
      return res.status(403).json({
        message: "Self-service registration is available for user accounts only.",
      });
    }

    if (usernameError || passwordError) {
      return res.status(400).json({
        message: usernameError || passwordError,
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
      role: "user",
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
    const password = normalizeBodyValue(req.body?.password);
    const role = normalizeBodyValue(req.body?.role).toLowerCase();

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
