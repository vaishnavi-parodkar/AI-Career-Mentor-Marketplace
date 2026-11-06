import { Check, Circle } from "lucide-react";
import { PASSWORD_RULES } from "../utils/password";

export default function PasswordChecklist({ password = "" }) {
  return (
    <ul className="-mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2" aria-label="Password requirements">
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(password);
        return (
          <li key={r.id} className={`flex items-center gap-1.5 text-xs ${ok ? "font-semibold text-green" : "text-text-muted"}`}>
            {ok ? <Check size={13} aria-hidden="true" /> : <Circle size={11} aria-hidden="true" />}
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}
