import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from "../services/authService";

const STORAGE_KEY = "nowait-auth-session";
const REMEMBER_KEY = "nowait-auth-remember";
const AuthContext = createContext(null);

function readStoredSession() {
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

function persistSession(session, remember = true) {
  const storage = remember ? window.localStorage : window.sessionStorage;
  const fallbackStorage = remember ? window.sessionStorage : window.localStorage;

  fallbackStorage.removeItem(STORAGE_KEY);
  window.localStorage.setItem(REMEMBER_KEY, JSON.stringify(remember));
  storage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(REMEMBER_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const storedSession =
    typeof window !== "undefined"
      ? readStoredSession()
      : { token: null, user: null };
  const [session, setSession] = useState({
    token: storedSession.token,
    user: storedSession.user,
    remember: storedSession.remember ?? true,
    loading: Boolean(storedSession.token),
  });

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!session.token) {
        setSession((current) =>
          current.loading ? { ...current, loading: false } : current,
        );
        return;
      }

      try {
        const { user } = await getCurrentUser(session.token);

        if (!cancelled) {
          persistSession(
            { token: session.token, user },
            session.remember ?? true,
          );
          setSession({
            token: session.token,
            user,
            remember: session.remember ?? true,
            loading: false,
          });
        }
      } catch {
        clearStoredSession();

        if (!cancelled) {
          setSession({
            token: null,
            user: null,
            loading: false,
          });
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [session.remember, session.token]);

  async function login(credentials, options = {}) {
    const payload = await loginRequest(credentials);
    const remember = options.remember ?? true;

    persistSession(
      {
        token: payload.token,
        user: payload.user,
      },
      remember,
    );
    setSession({
      token: payload.token,
      user: payload.user,
      remember,
      loading: false,
    });
    return payload;
  }

  async function register(payload) {
    return registerRequest(payload);
  }

  function logout() {
    clearStoredSession();
    setSession({
      token: null,
      user: null,
      loading: false,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        isAdmin: session.user?.role === "admin",
        isAuthenticated: Boolean(session.token),
        isUser: session.user?.role === "user",
        loading: session.loading,
        login,
        logout,
        rememberSession: session.remember ?? true,
        register,
        token: session.token,
        user: session.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
