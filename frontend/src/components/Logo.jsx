import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ to = "/home", className = "" }) {
  return (
    <Link to={to} className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dark-green text-off-white">
        <Leaf size={18} />
      </span>
      <span className="font-heading text-xl font-bold text-dark-green">Pathwise</span>
    </Link>
  );
}
