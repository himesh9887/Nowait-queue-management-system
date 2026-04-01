const STORAGE_KEY = "nowait-auth-session";
const REMEMBER_KEY = "nowait-auth-remember";
const FLASH_KEY = "nowait-auth-flash";
const LAST_ROLE_KEY = "nowait-auth-last-role";

export const AUTH_SESSION_EXPIRED_EVENT = "nowait:auth-session-expired";

export function readStoredSession() {
  if (typeof window === "undefined") {
    return { token: null, user: null, remember: true };
  }

  try {
    const rememberedValue = window.localStorage.getItem(REMEMBER_KEY);
    const remembered = rememberedValue === null ? true : rememberedValue === "true";
    const storage = remembered ? window.localStorage : window.sessionStorage;
    const raw = storage.getItem(STORAGE_KEY);
    const fallbackRaw =
      rememberedValue === null ? window.localStorage.getItem(STORAGE_KEY) : null;

    return raw || fallbackRaw
      ? {
          ...JSON.parse(raw || fallbackRaw),
          remember: remembered,
        }
      : { token: null, user: null, remember: remembered };
  } catch {
    return { token: null, user: null, remember: true };
  }
}

export function persistSession(session, remember = true) {
  if (typeof window === "undefined") {
    return;
  }

  const storage = remember ? window.localStorage : window.sessionStorage;
  const fallbackStorage = remember ? window.sessionStorage : window.localStorage;

  fallbackStorage.removeItem(STORAGE_KEY);
  window.localStorage.setItem(REMEMBER_KEY, JSON.stringify(remember));
  storage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(REMEMBER_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function setAuthFlashMessage(message) {
  if (typeof window === "undefined" || !message) {
    return;
  }

  try {
    window.sessionStorage.setItem(FLASH_KEY, message);
  } catch {
    // Ignore storage issues and continue with the session reset flow.
  }
}

export function readAuthFlashMessage() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const message = window.sessionStorage.getItem(FLASH_KEY) || "";
    window.sessionStorage.removeItem(FLASH_KEY);
    return message;
  } catch {
    return "";
  }
}

export function persistLastLoginRole(role) {
  if (
    typeof window === "undefined" ||
    !role ||
    !["user", "admin"].includes(role)
  ) {
    return;
  }

  try {
    window.localStorage.setItem(LAST_ROLE_KEY, role);
  } catch {
    // Ignore storage issues so sign-in can still continue.
  }
}

export function readLastLoginRole(fallback = "user") {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const role = window.localStorage.getItem(LAST_ROLE_KEY);
    return ["user", "admin"].includes(role) ? role : fallback;
  } catch {
    return fallback;
  }
}
