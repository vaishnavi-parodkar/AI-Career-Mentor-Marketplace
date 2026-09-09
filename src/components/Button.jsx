const variants = {
  primary:
    "bg-dark-green text-off-white hover:bg-green active:scale-[0.98] shadow-card",
  coral:
    "bg-coral text-off-white hover:brightness-95 active:scale-[0.98] shadow-card",
  outline:
    "bg-transparent border border-dark-green text-dark-green hover:bg-light-sage active:scale-[0.98]",
  ghost:
    "bg-transparent text-dark-green hover:bg-light-sage active:scale-[0.98]",
  subtle:
    "bg-light-sage text-dark-green hover:brightness-95 active:scale-[0.98]",
};

const sizes = {
  sm: "text-sm px-4 py-2",
  md: "text-sm sm:text-base px-5 py-3",
  lg: "text-base px-6 py-3.5",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  as: Component = "button",
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon size={18} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={18} />}
    </Component>
  );
}
