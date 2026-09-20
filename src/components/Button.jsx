const variants = {
  primary: "bg-dark-green text-off-white hover:bg-green active:scale-[0.98] shadow-card",
  coral: "bg-coral text-off-white hover:brightness-95 active:scale-[0.98] shadow-card",
  outline: "border border-dark-green bg-transparent text-dark-green hover:bg-light-sage active:scale-[0.98]",
  ghost: "bg-transparent text-dark-green hover:bg-light-sage active:scale-[0.98]",
  subtle: "bg-light-sage text-dark-green hover:brightness-95 active:scale-[0.98]",
};

const sizes = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-11 px-5 py-3 text-sm sm:text-base",
  lg: "min-h-12 px-6 py-3.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  as: Component = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-55 ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : (
        Icon && iconPosition === "left" && <Icon size={18} aria-hidden="true" />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={18} aria-hidden="true" />}
    </Component>
  );
}
