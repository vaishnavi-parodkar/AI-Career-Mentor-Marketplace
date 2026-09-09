import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to, className = "" }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-border bg-off-white text-dark-green hover:bg-light-sage ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft size={18} />
    </button>
  );
}
