const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])?$/;
const MIN_PASSWORD_LENGTH = 8;

export function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export function validateUsername(value) {
  const username = normalizeUsername(value);

  if (!username) {
    return "Username is required.";
  }

  if (username.length < 3 || username.length > 32) {
    return "Username must be between 3 and 32 characters long.";
  }

  if (!USERNAME_PATTERN.test(username)) {
    return "Use lowercase letters, numbers, periods, underscores, and hyphens only.";
  }

  return "";
}

export function validatePassword(value) {
  const password = String(value || "");

  if (!password.trim()) {
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
