import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", label: "Predictor", end: true },
  { to: "/entry", label: "My Entry" },
  { to: "/groups", label: "Groups" },
];

function navClass(isActive: boolean) {
  return [
    "rounded-md px-3 py-2 text-sm font-bold transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  ].join(" ");
}

export default function SiteNav() {
  const { user, loading } = useAuth();

  return (
    <nav
      aria-label="Primary navigation"
      className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur"
    >
      <div className="container flex min-h-14 max-w-[1100px] flex-wrap items-center justify-between gap-2 py-2">
        <NavLink
          to="/"
          end
          className="font-display text-sm font-black tracking-wide text-foreground sm:text-base"
        >
          P4 ODDSMAKER
        </NavLink>

        <div className="flex flex-wrap items-center justify-end gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => navClass(isActive)}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/account"
            className={({ isActive }) => navClass(isActive)}
          >
            {loading ? "Account" : user ? "Account" : "Sign in"}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
