import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const titleId = title ? "pathwise-modal-title" : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-dark/40 backdrop-blur-[1px] sm:items-center">
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-off-white p-6 shadow-soft sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="mb-5 flex items-center justify-between">
          {title && <h3 id={titleId} className="font-heading text-xl font-bold text-dark-green">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            className="focus-ring ml-auto flex h-11 w-11 items-center justify-center rounded-full text-text-muted hover:bg-light-sage hover:text-dark-green"
            aria-label="Close"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
