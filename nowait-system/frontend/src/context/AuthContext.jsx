import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentAdmin, loginAdmin } from "../services/authService";

const STORAGE_KEY = "nowait-admin-session";
const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: null, admin: null };
  } catch (_error) {
    return { token: null, admin: null };
  }
}

function persistSession(session) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const storedSession =
    typeof window !== "undefined"
      ? readStoredSession()
      : { token: null, admin: null };
  const [session, setSession] = useState({
    token: storedSession.token,
    admin: storedSession.admin,
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
        const { admin } = await getCurrentAdmin(session.token);

        if (!cancelled) {
          persistSession({ token: session.token, admin });
          setSession({
            token: session.token,
            admin,
            loading: false,
          });
        }
      } catch (_error) {
        clearStoredSession();

        if (!cancelled) {
          setSession({
            token: null,
            admin: null,
            loading: false,
          });
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [session.token]);

  async function login(credentials) {
    const payload = await loginAdmin(credentials);
    persistSession({
      token: payload.token,
      admin: payload.admin,
    });
    setSession({
      token: payload.token,
      admin: payload.admin,
      loading: false,
    });
    return payload;
  }

  function logout() {
    clearStoredSession();
    setSession({
      token: null,
      admin: null,
      loading: false,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        admin: session.admin,
        isAuthenticated: Boolean(session.token),
        loading: session.loading,
        login,
        logout,
        token: session.token,
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
