import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/home", label: "Home" },
  { to: "/careers", label: "Careers" },
  { to: "/mentors", label: "Mentors" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/progress", label: "Progress" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-light-sage text-dark-green"
                    : "text-text-dark hover:bg-light-sage/60"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={() => navigate("/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-light-sage text-dark-green hover:brightness-95"
            aria-label="Profile"
          >
            <User size={18} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-dark hover:bg-light-sage/60"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <button
          className="rounded-full p-2 text-dark-green lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-[#20312B]/40 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="ml-auto flex h-full w-72 max-w-[80%] flex-col bg-cream p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-dark-green hover:bg-light-sage"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-base font-semibold ${
                      isActive ? "bg-light-sage text-dark-green" : "text-text-dark"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/profile"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold text-text-dark"
              >
                Profile
              </NavLink>
            </nav>
            <button
              onClick={handleLogout}
              className="mt-auto flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold text-text-dark"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
