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
    <label className="grid gap-2.5" htmlFor={inputId}>
      {label && (
        <span className="text-sm font-semibold text-slate-200">
          {label}
        </span>
      )}

      <div className="relative flex items-center">
        {hasLeftIcon && (
          <span className="absolute left-4 flex text-slate-400">
            {icon}
          </span>
        )}

        <Component
          id={inputId}
          className={`
            input-field
            ${hasLeftIcon ? "pl-11" : ""}
            ${isSelect ? "pr-10" : ""}
            ${error ? "border-rose-400/50 ring-rose-400/20" : ""}
            ${className}
          `.trim()}
          type={as === "input" ? inputType : undefined}
          {...props}
        >
          {children}
        </Component>

        {isPasswordField && (
          <button
            type="button"
            className="absolute right-3 flex text-slate-400 transition hover:text-slate-200"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}

        {isSelect && (
          <span className="pointer-events-none absolute right-3 flex text-slate-400">
            <ChevronDownIcon className="h-5 w-5" />
          </span>
        )}
      </div>

      {error ? (
        <span className="text-xs font-medium text-rose-400/90">
          {error}
        </span>
      ) : helper ? (
        <span className="text-xs text-slate-400">
          {helper}
        </span>
      ) : null}
    </label>
  );
}
