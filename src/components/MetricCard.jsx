export default function MetricCard({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`rounded-xl2 border border-border bg-off-white p-4 shadow-card ${className}`}>
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-light-sage text-dark-green">
        {Icon && <Icon size={18} />}
      </div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="font-heading text-lg font-bold text-dark-green">{value}</p>
    </div>
  );
}
