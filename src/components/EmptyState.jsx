export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border bg-off-white/60 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-light-sage text-dark-green">
          <Icon size={26} aria-hidden="true" />
        </div>
      )}
      <h3 className="mb-2 font-heading text-xl font-bold text-dark-green">{title}</h3>
      {description && <p className="mb-5 max-w-md type-supporting">{description}</p>}
      {action}
    </div>
  );
}
