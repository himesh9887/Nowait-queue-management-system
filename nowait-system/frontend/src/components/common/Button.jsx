function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden="true"
    />
  );
}

const variants = {
  premium: "auth-premium-button",
  primary: "primary-button",
  secondary: "secondary-button",
  danger: "danger-button",
};

export default function Button({
  children,
  loading = false,
  disabled = false,
  variant = "premium",
  className = "",
  type = "button",
  fullWidth = true,
  ...props
}) {
  return (
    <button
      type={type}
      className={`${variants[variant] || variants.premium} h-14 ${fullWidth ? "w-full" : ""} gap-2 ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      <span>{children}</span>
    </button>
  );
}
