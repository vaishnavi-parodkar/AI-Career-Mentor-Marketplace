export default function Card({ children, className = "", padded = true, as: Component = "div", ...props }) {
  return (
    <Component
      className={`rounded-xl2 border border-border bg-off-white shadow-card ${
        padded ? "p-5" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
