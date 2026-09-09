import { NavLink } from "react-router-dom";
import { Home, Compass, Users, Map, BarChart3 } from "lucide-react";

const links = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/careers", label: "Careers", icon: Compass },
  { to: "/mentors", label: "Mentors", icon: Users },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/progress", label: "Progress", icon: BarChart3 },
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-off-white/95 backdrop-blur lg:hidden">
      <div className="flex items-center justify-around px-1 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-dark-green" : "text-text-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive ? "bg-light-sage" : ""
                  }`}
                >
                  <Icon size={19} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
