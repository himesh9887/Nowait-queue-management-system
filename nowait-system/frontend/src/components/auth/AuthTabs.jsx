import { Link } from "react-router-dom";

export default function AuthTabs({ active }) {
  return (
    <div className="auth-tabs">
      <Link
        to="/login"
        className={active === "login" ? "auth-tab auth-tab-active" : "auth-tab auth-tab-idle"}
      >
        Login
      </Link>
      <Link
        to="/register"
        className={
          active === "register" ? "auth-tab auth-tab-active" : "auth-tab auth-tab-idle"
        }
      >
        Register
      </Link>
    </div>
  );
}
