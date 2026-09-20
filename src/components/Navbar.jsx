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
    <header className="sticky top-0 z-40 border-b border-border bg-cream/95">
      <div className="container-app flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `focus-ring rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-light-sage text-dark-green" : "text-text-dark hover:bg-light-sage/60"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-light-sage text-dark-green hover:brightness-95"
            aria-label="Profile"
          >
            <User size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="focus-ring flex min-h-11 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-dark hover:bg-light-sage/60"
          >
            <LogOut size={16} aria-hidden="true" /> Logout
          </button>
        </div>

        <button
          type="button"
          className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-dark-green lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu size={24} aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-text-dark/40 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="ml-auto flex h-full w-72 max-w-[86%] flex-col bg-cream p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-dark-green hover:bg-light-sage"
                aria-label="Close menu"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `focus-ring rounded-xl px-4 py-3 text-base font-semibold ${
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
                className="focus-ring rounded-xl px-4 py-3 text-base font-semibold text-text-dark"
              >
                Profile
              </NavLink>
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              className="focus-ring mt-auto flex min-h-11 items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold text-text-dark"
            >
              <LogOut size={16} aria-hidden="true" /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
