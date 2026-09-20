export default function Card({
  children,
  className = "",
  padded = true,
  elevated = false,
  interactive = false,
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={`rounded-xl border border-border bg-off-white ${
        padded ? "p-5" : ""
      } ${elevated ? "shadow-card" : ""} ${
        interactive ? "transition-shadow hover:shadow-soft focus-within:shadow-soft" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
