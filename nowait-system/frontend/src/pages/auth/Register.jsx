import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  LockIcon,
  ShieldIcon,
  UserIcon,
} from "../../components/auth/AuthIcons";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";

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
    role: "user",
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
      username: form.username.trim() ? "" : "Username is required.",
      password: form.password.trim() ? "" : "Password is required.",
      confirmPassword: form.confirmPassword.trim()
        ? form.password === form.confirmPassword
          ? ""
          : "Passwords do not match."
        : "Please confirm your password.",
      role: form.role ? "" : "Please select a role.",
    };

    setFieldErrors(nextErrors);

    if (
      nextErrors.username ||
      nextErrors.password ||
      nextErrors.confirmPassword ||
      nextErrors.role
    ) {
      setErrorMessage("Please review the highlighted fields before creating your account.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await register({
        username: form.username.trim(),
        password: form.password,
        role: form.role,
      });

      setSuccessMessage(response.message);
      toast.success(response.message);

      navigate("/login", {
        replace: true,
        state: {
          username: form.username.trim(),
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
      description="Create your account to unlock smart booking, live queue tracking, and admin controls with a polished role-based experience."
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
          placeholder="Choose a username"
          autoComplete="username"
          helper="This will be used to sign in across the platform."
          error={fieldErrors.username}
        />

        <Input
          label="Password"
          type="password"
          icon={<LockIcon className="h-5 w-5" />}
          showPasswordToggle
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="Create a password"
          autoComplete="new-password"
          helper="Use at least 6 characters for a secure account."
          error={fieldErrors.password}
        />

        <Input
          label="Confirm Password"
          type="password"
          icon={<CheckCircleIcon className="h-5 w-5" />}
          showPasswordToggle
          value={form.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />

        <Input
          as="select"
          label="Role"
          icon={<ShieldIcon className="h-5 w-5" />}
          value={form.role}
          onChange={(event) => updateField("role", event.target.value)}
          error={fieldErrors.role}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Input>

        <Button type="submit" loading={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="auth-link-inline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
