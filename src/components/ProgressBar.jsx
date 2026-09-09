export default function ProgressBar({ value = 0, max = 100, className = "", color = "bg-dark-green", trackColor = "bg-light-sage", height = "h-2" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`w-full overflow-hidden rounded-full ${trackColor} ${height} ${className}`}>
      <div
        className={`${height} rounded-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
