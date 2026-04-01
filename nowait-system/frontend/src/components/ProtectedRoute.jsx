import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

function getHomeByRole(role) {
  return role === "admin" ? "/admin-dashboard" : "/user-dashboard";
}

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const intendedRole = allowedRoles?.length === 1 ? allowedRoles[0] : undefined;
  const requestedPath = `${location.pathname}${location.search}${location.hash}`;

  if (loading) {
    return <LoadingScreen label="Restoring session..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: requestedPath,
          intendedRole,
          notice: intendedRole
            ? `Sign in to continue to the ${intendedRole} workspace.`
            : "Sign in to continue.",
        }}
      />
    );
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getHomeByRole(user?.role)} replace />;
  }

  return <Outlet />;
}
