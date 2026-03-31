import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
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
import {
  normalizeUsername,
  validatePassword,
  validateUsername,
} from "../../utils/authValidation";

function getDashboardForRole(role) {
  return role === "admin" ? "/admin-dashboard" : "/user-dashboard";
}

export default function Register() {
  const { isAuthenticated, loading, register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
      username: validateUsername(form.username),
      password: validatePassword(form.password),
      confirmPassword: form.confirmPassword.trim()
        ? form.password === form.confirmPassword
          ? ""
          : "Passwords do not match."
        : "Please confirm your password.",
    };

    setFieldErrors(nextErrors);

    if (nextErrors.username || nextErrors.password || nextErrors.confirmPassword) {
      setErrorMessage("Please review the highlighted fields before creating your account.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await register({
        username: normalizeUsername(form.username),
        password: form.password,
      });

      setSuccessMessage(response.message);
      toast.success(response.message);

      navigate("/login", {
        replace: true,
        state: {
          username: normalizeUsername(form.username),
          message: "Account created successfully. Sign in to continue.",
        },
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
      activeTab="register"
      eyebrow="Create Account"
      title="Join the NoWait platform"
      description="Create your user account to unlock smart booking, live queue tracking, invoices, and notifications. Admin workspaces are provisioned separately for security."
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
          placeholder="choose a username"
          autoComplete="username"
          helper="3-32 characters. Use lowercase, numbers, periods, underscores, or hyphens."
          error={fieldErrors.username}
        />

        <Input
          label="Password"
          type="password"
          icon={<LockIcon className="h-5 w-5" />}
          showPasswordToggle
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="create a strong password"
          autoComplete="new-password"
          helper="Minimum 8 characters with at least one letter and one number."
          error={fieldErrors.password}
        />

        <Input
          label="Confirm Password"
          type="password"
          icon={<CheckCircleIcon className="h-5 w-5" />}
          showPasswordToggle
          value={form.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          placeholder="re-enter your password"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />

        <Button type="submit" loading={submitting} variant="premium" fullWidth>
          {submitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
          Sign in here
        </Link>
      </p>
    </AuthLayout>
  );
}
