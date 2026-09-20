export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20" role="status" aria-live="polite">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-light-sage border-t-dark-green" aria-hidden="true" />
      <p className="type-supporting">{label}</p>
    </div>
  );
}
