export default function Tabs({ tabs, active, onChange, className = "" }) {
  return (
    <div className={`flex gap-1 overflow-x-auto no-scrollbar rounded-full bg-light-sage p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
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
