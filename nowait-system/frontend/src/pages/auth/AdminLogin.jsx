import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import GlassPanel from "../../components/GlassPanel";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      await login(form);
      toast.success("Admin signed in successfully.");
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg">
        <GlassPanel
          className="animated-border"
          eyebrow="Admin Access"
          title="Control the queue securely"
          description="Use the admin credentials configured in the backend environment to manage live operations."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Username
              <input
                className="soft-input"
                type="text"
                value={form.username}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    username: event.target.value,
                  }))
                }
                placeholder="admin"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Password
              <input
                className="soft-input"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    password: event.target.value,
                  }))
                }
                placeholder="Enter admin password"
              />
            </label>

            <button
              type="submit"
              className="primary-button h-12 w-full"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign in to dashboard"}
            </button>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}
