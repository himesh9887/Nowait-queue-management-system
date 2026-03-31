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
import { normalizeUsername } from "../../utils/authValidation";

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
          username: normalizeUsername(form.username),
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
          <div className="text-sm">{successMessage}</div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="auth-banner auth-banner-error">
          <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">{errorMessage}</div>
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Username"
          icon={<UserIcon className="h-5 w-5" />}
          value={form.username}
          onChange={(event) => updateField("username", event.target.value)}
          placeholder="your username"
          autoComplete="username"
          helper="Sign in with your registered username."
          error={fieldErrors.username}
        />

        <Input
          label="Password"
          type="password"
          icon={<LockIcon className="h-5 w-5" />}
          showPasswordToggle
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="your password"
          autoComplete="current-password"
          helper="Your password is encrypted and secure."
          error={fieldErrors.password}
        />

        <div className="flex items-center justify-between gap-4 rounded-lg border border-white/8 bg-slate-950/40 px-4 py-3">
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="checkbox-field"
            />
            <span>Remember this device</span>
          </label>
        </div>

        <Button type="submit" loading={submitting} variant="premium" fullWidth>
          {submitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
