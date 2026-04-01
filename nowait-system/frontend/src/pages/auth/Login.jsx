import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  LockIcon,
  ShieldIcon,
  UserIcon,
} from "../../components/auth/AuthIcons";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import {
  normalizeUsername,
  validateUsername,
} from "../../utils/authValidation";
import {
  persistLastLoginRole,
  readAuthFlashMessage,
  readLastLoginRole,
} from "../../utils/authSession";

function getDashboardForRole(role) {
  return role === "admin" ? "/admin-dashboard" : "/user-dashboard";
}

function isAllowedRole(role) {
  return role === "user" || role === "admin";
}

function getSafeDestination(candidate, role) {
  if (typeof candidate !== "string" || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return getDashboardForRole(role);
  }

  if (candidate.startsWith("/admin") || candidate.startsWith("/admin-dashboard")) {
    return role === "admin" ? candidate : getDashboardForRole(role);
  }

  if (candidate.startsWith("/user") || candidate.startsWith("/user-dashboard")) {
    return role === "user" ? candidate : getDashboardForRole(role);
  }

  return candidate;
}

const LOGIN_ROLE_OPTIONS = [
  {
    role: "user",
    title: "User workspace",
    eyebrow: "Customer Sign In",
    heroTitle: "Track your token without the rush",
    description:
      "Sign in as a customer to book tokens, follow the live queue, and keep invoices ready from one clean dashboard.",
    helper:
      "Best for visitors, patients, or customers checking their turn and booking status.",
    icon: UserIcon,
    accentClasses:
      "border-cyan-400/35 bg-cyan-500/10 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]",
    iconClasses: "bg-cyan-400/15 text-cyan-200",
    tag: "Book and track",
    submitLabel: "Open User Workspace",
    rememberLabel: "Keep me signed in on this device",
  },
  {
    role: "admin",
    title: "Admin console",
    eyebrow: "Admin Sign In",
    heroTitle: "Run the live queue with confidence",
    description:
      "Sign in as an admin to control token flow, manage queue actions, and monitor live service movement across the system.",
    helper:
      "Best for staff running counters, reviewing bookings, and controlling service operations.",
    icon: ShieldIcon,
    accentClasses:
      "border-violet-400/35 bg-violet-500/10 text-violet-100 shadow-[0_0_0_1px_rgba(167,139,250,0.12)]",
    iconClasses: "bg-violet-400/15 text-violet-200",
    tag: "Manage operations",
    submitLabel: "Access Admin Console",
    rememberLabel: "Keep this admin device trusted",
  },
];

const DEV_DEMO_CREDENTIALS = {
  admin: {
    username: "admin",
    password: "admin123",
  },
  user: {
    username: "user",
    password: "user123",
  },
};

export default function Login() {
  const { isAuthenticated, loading, login, rememberSession, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = isAllowedRole(location.state?.intendedRole)
    ? location.state.intendedRole
    : readLastLoginRole("user");
  const [form, setForm] = useState({
    username: location.state?.username || "",
    password: "",
  });
  const [loginRole, setLoginRole] = useState(initialRole);
  const [rememberMe, setRememberMe] = useState(rememberSession);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");
  const [noticeMessage, setNoticeMessage] = useState(
    location.state?.notice || readAuthFlashMessage(),
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [capsLockOn, setCapsLockOn] = useState(false);
  const selectedRole =
    LOGIN_ROLE_OPTIONS.find((option) => option.role === loginRole) ||
    LOGIN_ROLE_OPTIONS[0];
  const isDevEnvironment = import.meta.env.DEV;

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(getDashboardForRole(user?.role), { replace: true });
    }
  }, [isAuthenticated, loading, navigate, user?.role]);

  useEffect(() => {
    setRememberMe(rememberSession);
  }, [rememberSession]);

  useEffect(() => {
    if (isAllowedRole(location.state?.intendedRole)) {
      setLoginRole(location.state.intendedRole);
    }

    if (location.state?.notice) {
      setNoticeMessage(location.state.notice);
    }
  }, [location.state]);

  useEffect(() => {
    persistLastLoginRole(loginRole);
  }, [loginRole]);

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
    setNoticeMessage("");
  }

  function handleRoleSelect(role) {
    setLoginRole(role);
    setErrorMessage("");
    setNoticeMessage("");
  }

  function handleUsernameBlur() {
    setForm((previous) => ({
      ...previous,
      username: normalizeUsername(previous.username),
    }));
  }

  function handlePasswordKeyState(event) {
    if (typeof event.getModifierState === "function") {
      setCapsLockOn(event.getModifierState("CapsLock"));
    }
  }

  function applyDemoCredentials(role) {
    const credentials = DEV_DEMO_CREDENTIALS[role];

    if (!credentials) {
      return;
    }

    setLoginRole(role);
    setForm({
      username: credentials.username,
      password: credentials.password,
    });
    setFieldErrors({});
    setErrorMessage("");
    setNoticeMessage(
      role === "admin"
        ? "Default local admin credentials filled for quick testing."
        : "Default local user credentials filled for quick testing.",
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setNoticeMessage("");

    const nextErrors = {
      username: validateUsername(form.username),
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
          role: loginRole,
        },
        {
          remember: rememberMe,
        },
      );

      toast.success(
        response.user.role === "admin"
          ? "Admin access granted."
          : "User workspace ready.",
      );
      navigate(
        getSafeDestination(location.state?.from, response.user.role),
        {
          replace: true,
        },
      );
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
      eyebrow={selectedRole.eyebrow}
      title={selectedRole.heroTitle}
      description={selectedRole.description}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {LOGIN_ROLE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = option.role === loginRole;

            return (
              <button
                key={option.role}
                type="button"
                onClick={() => handleRoleSelect(option.role)}
                className={`rounded-[1.35rem] border px-4 py-4 text-left transition duration-200 ${
                  isActive
                    ? option.accentClasses
                    : "border-white/10 bg-slate-950/35 text-slate-200 hover:border-white/20 hover:bg-slate-900/55"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
                      isActive ? option.iconClasses : "bg-white/8 text-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-300">
                    {option.tag}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-base font-semibold text-white">{option.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-300">{option.helper}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/45 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Selected mode
              </div>
              <div className="mt-2 text-lg font-semibold text-white">{selectedRole.title}</div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-slate-300">
              <ClockIcon className="h-4 w-4" />
              <span>Smart redirect enabled</span>
            </div>
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-300">{selectedRole.helper}</p>
        </div>
      </div>

      {successMessage ? (
        <div className="auth-banner auth-banner-success">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">{successMessage}</div>
        </div>
      ) : null}

      {noticeMessage ? (
        <div className="rounded-[1.2rem] border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          {noticeMessage}
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
          onBlur={handleUsernameBlur}
          placeholder="your username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          helper={
            loginRole === "admin"
              ? "Use your provisioned admin username."
              : "Use the username you registered with."
          }
          error={fieldErrors.username}
        />

        <Input
          label="Password"
          type="password"
          icon={<LockIcon className="h-5 w-5" />}
          showPasswordToggle
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          onKeyDown={handlePasswordKeyState}
          onKeyUp={handlePasswordKeyState}
          placeholder="your password"
          autoComplete="current-password"
          helper={
            capsLockOn
              ? "Caps Lock appears to be on."
              : loginRole === "admin"
                ? "Admin access uses the same secure password verification."
                : "Your password is verified securely before access is granted."
          }
          error={fieldErrors.password}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-white/8 bg-slate-950/40 px-4 py-3">
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="checkbox-field"
            />
            <span>{selectedRole.rememberLabel}</span>
          </label>
        </div>

        <Button type="submit" loading={submitting} variant="premium" fullWidth>
          {submitting ? "Signing in..." : selectedRole.submitLabel}
        </Button>
      </form>

      {isDevEnvironment ? (
        <div className="mt-6 rounded-[1.3rem] border border-white/10 bg-slate-950/35 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Local demo access
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyDemoCredentials(loginRole)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              Use selected demo
            </button>
            <button
              type="button"
              onClick={() => applyDemoCredentials(loginRole === "admin" ? "user" : "admin")}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              Fill {loginRole === "admin" ? "user" : "admin"} demo
            </button>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Demo credentials are shown only during local development and match the seeded defaults from the backend.
          </p>
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
