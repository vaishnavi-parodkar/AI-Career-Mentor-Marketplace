export default function MetricCard({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`rounded-xl border border-border bg-off-white p-4 ${className}`}>
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-light-sage text-dark-green">
        {Icon && <Icon size={18} aria-hidden="true" />}
      </div>
      <p className="type-meta">{label}</p>
      <p className="mt-1 font-heading text-lg font-bold text-dark-green">{value}</p>
    </div>
  );
}
