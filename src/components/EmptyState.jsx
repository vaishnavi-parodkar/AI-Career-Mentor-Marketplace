export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-border bg-off-white/60 px-6 py-12 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-light-sage text-dark-green">
          <Icon size={26} />
        </div>
      )}
      <h3 className="mb-1 font-heading text-lg font-bold text-dark-green">{title}</h3>
      {description && <p className="mb-4 max-w-xs text-sm text-text-muted">{description}</p>}
      {action}
    </div>
  );
}
