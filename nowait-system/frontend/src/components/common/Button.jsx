function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden="true"
    />
  );
}

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  tertiary: "btn-tertiary",
  danger: "btn-danger",
  success: "btn-success",
  premium: "auth-premium-button",
};

const sizes = {
  sm: "btn-sm",
  md: "px-5 py-3 text-sm",
  lg: "btn-lg",
};

export default function Button({
  children,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  fullWidth = false,
  ...props
}) {
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = variants[variant] === "auth-premium-button" ? "h-14" : sizes[size] || sizes.md;
  const widthClass = fullWidth ? "btn-block" : "";

  return (
    <button
      type={type}
      className={`${variantClass} ${sizeClass} ${widthClass} gap-2 ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
