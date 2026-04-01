import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from "../services/authService";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  clearStoredSession,
  persistSession,
  readStoredSession,
  setAuthFlashMessage,
} from "../utils/authSession";

const AuthContext = createContext(null);

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
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function handleSessionExpired(event) {
      if (!sessionRef.current.token) {
        return;
      }

      clearStoredSession();
      setAuthFlashMessage(
        event.detail?.message || "Your session has expired. Please sign in again.",
      );
      setSession((current) => ({
        token: null,
        user: null,
        remember: current.remember ?? true,
        loading: false,
      }));
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
    };
  }, []);

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
            remember: session.remember ?? true,
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
    setSession((current) => ({
      token: null,
      user: null,
      remember: current.remember ?? true,
      loading: false,
    }));
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
