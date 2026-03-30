import { useId, useState } from "react";
import {
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
} from "../auth/AuthIcons";

export default function Input({
  as = "input",
  label,
  error,
  helper,
  className = "",
  type = "text",
  showPasswordToggle = false,
  icon = null,
  children,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password" && showPasswordToggle;
  const isSelect = as === "select";
  const inputType = isPasswordField && showPassword ? "text" : type;
  const Component = as;
  const hasLeftIcon = Boolean(icon);

  return (
    <label className="grid gap-2.5 text-sm font-medium text-slate-200" htmlFor={inputId}>
      {label ? <span className="auth-field-label">{label}</span> : null}

      <div
        className={`auth-input-shell ${hasLeftIcon ? "auth-input-has-icon" : ""} ${isSelect ? "auth-input-is-select" : ""}`}
      >
        {hasLeftIcon ? <span className="auth-input-icon">{icon}</span> : null}

        <Component
          id={inputId}
          className={`auth-input-control ${className}`.trim()}
          type={as === "input" ? inputType : undefined}
          {...props}
        >
          {children}
        </Component>

        {isPasswordField ? (
          <button
            type="button"
            className="auth-input-toggle"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOffIcon className="h-[18px] w-[18px]" />
            ) : (
              <EyeIcon className="h-[18px] w-[18px]" />
            )}
          </button>
        ) : null}

        {isSelect ? (
          <span className="auth-select-caret">
            <ChevronDownIcon className="h-[18px] w-[18px]" />
          </span>
        ) : null}
      </div>

      {error ? (
        <span className="auth-error-text">{error}</span>
      ) : helper ? (
        <span className="auth-helper-text">{helper}</span>
      ) : null}
    </label>
  );
}
