import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", label: "Predictor", end: true },
  { to: "/entry", label: "My Entry" },
  { to: "/groups", label: "Groups" },
];

function navClass(isActive: boolean) {
  return [
    "min-w-0 rounded-md px-2 py-2 text-center text-xs font-bold transition-colors sm:px-3 sm:text-sm",
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
      <div className="container flex max-w-[1100px] flex-col gap-1 py-2 sm:min-h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <NavLink
          to="/"
          end
          className="text-center font-display text-sm font-black tracking-wide text-foreground sm:text-left sm:text-base"
        >
          P4 ODDSMAKER
        </NavLink>

        <div className="grid grid-cols-4 gap-1 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
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
