export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-light-sage border-t-dark-green" />
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}
