export default function MatchRing({
  value = 0,
  size = 56,
  strokeWidth = 5,
  valueClassName = "text-sm",
}) {
  const numericValue = Number(value);
  const displayValue = Number.isFinite(numericValue) ? numericValue : 0;
  const progressValue = Math.max(0, Math.min(displayValue, 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressValue / 100) * circumference;
  const color = displayValue >= 85 ? "#0A634D" : displayValue >= 65 ? "#AABF78" : "#E9877B";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${displayValue}% career match`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8EEDC"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-heading font-bold text-dark-green ${valueClassName}`}>
          {displayValue}%
        </span>
      </div>
    </div>
  );
}
