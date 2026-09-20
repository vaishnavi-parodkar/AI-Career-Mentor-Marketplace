export default function Tabs({ tabs, active, onChange, className = "" }) {
  return (
    <div className={`flex gap-1 overflow-x-auto no-scrollbar rounded-full bg-light-sage p-1 ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={`focus-ring min-h-10 shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            active === tab.value
              ? "bg-dark-green text-off-white shadow-card"
              : "text-dark-green hover:bg-off-white/60"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
