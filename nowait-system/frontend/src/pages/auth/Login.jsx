import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  LockIcon,
  UserIcon,
} from "../../components/auth/AuthIcons";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";

function getDashboardForRole(role) {
  return role === "admin" ? "/admin-dashboard" : "/user-dashboard";
}

export default function Login() {
  const { isAuthenticated, loading, login, rememberSession, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    username: location.state?.username || "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(rememberSession);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || "",
  );
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(getDashboardForRole(user?.role), { replace: true });
    }
  }, [isAuthenticated, loading, navigate, user?.role]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const nextErrors = {
      username: form.username.trim() ? "" : "Username is required.",
      password: form.password.trim() ? "" : "Password is required.",
    };

    setFieldErrors(nextErrors);

    if (nextErrors.username || nextErrors.password) {
      setErrorMessage("Please complete the highlighted fields to continue.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await login(
        {
          username: form.username.trim(),
          password: form.password,
        },
        {
          remember: rememberMe,
        },
      );

      toast.success(`Signed in as ${response.user.role}.`);
      navigate(location.state?.from || getDashboardForRole(response.user.role), {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      activeTab="login"
      eyebrow="Secure Sign In"
      title="Access your queue workspace"
      description="Log in to manage bookings, monitor live queue movement, and switch into the dashboard built for your role."
    >
      {successMessage ? (
        <div className="auth-banner auth-banner-success">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>{successMessage}</div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="auth-banner auth-banner-error">
          <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>{errorMessage}</div>
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Username"
          icon={<UserIcon className="h-5 w-5" />}
          value={form.username}
          onChange={(event) => updateField("username", event.target.value)}
          placeholder="Enter your username"
          autoComplete="username"
          error={fieldErrors.username}
        />

        <Input
          label="Password"
          type="password"
          icon={<LockIcon className="h-5 w-5" />}
          showPasswordToggle
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={fieldErrors.password}
        />

        <div className="auth-support-row">
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-transparent accent-sky-400"
            />
            Remember this device
          </label>
        </div>

        <Button type="submit" loading={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="auth-link-inline">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
