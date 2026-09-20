export default function ProgressBar({
  value = 0,
  max = 100,
  className = "",
  color = "bg-dark-green",
  trackColor = "bg-light-sage",
  height = "h-2",
  label = "Progress",
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={`w-full overflow-hidden rounded-full ${trackColor} ${height} ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin="0"
      aria-valuemax={max}
      aria-valuenow={Math.min(max, Math.max(0, value))}
    >
      <div className={`${height} rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}
