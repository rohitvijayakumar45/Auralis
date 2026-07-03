import {
  Images,
  LayoutDashboard,
  Settings,
  Star,
  Upload
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../../lib/cn";
import { useCurrentUser } from "../../hooks/usePhotoData";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Gallery", path: "/gallery", icon: Images },
  { label: "Upload", path: "/upload", icon: Upload },
  { label: "Albums", path: "/albums", icon: Images },
  { label: "Favorites", path: "/favorites", icon: Star },
  { label: "Settings", path: "/settings", icon: Settings }
];

export function AppShell() {
  const { data: user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-bone text-charcoal">
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-72 rounded-[2rem] border border-charcoal/10 bg-ivory/85 p-4 shadow-soft backdrop-blur-xl lg:block">
        <NavLink to="/" className="mb-8 flex items-center gap-3 px-3 py-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-charcoal text-bone">
            A
          </span>
          <span>
            <span className="block font-serif text-2xl font-semibold">Auralis</span>
            <span className="text-xs uppercase tracking-[0.22em] text-charcoal/45">
              private cloud
            </span>
          </span>
        </NavLink>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-charcoal/70 transition",
                  isActive
                    ? "bg-charcoal text-bone shadow-soft"
                    : "hover:bg-charcoal/5 hover:text-charcoal"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] bg-bone p-4">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-charcoal text-sm font-medium text-bone">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{user?.name ?? "Loading"}</p>
              <p className="text-xs text-charcoal/50">
                {user ? `${user.storageUsedGb} of ${user.storageLimitGb} GB` : ""}
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-linen">
            <div
              className="h-full rounded-full bg-olive"
              style={{
                width: user
                  ? `${Math.round((user.storageUsedGb / user.storageLimitGb) * 100)}%`
                  : "0%"
              }}
            />
          </div>
        </div>
      </aside>
      <header className="sticky top-0 z-30 border-b border-charcoal/10 bg-bone/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="font-serif text-2xl font-semibold">
            Auralis
          </NavLink>
          <NavLink
            to="/upload"
            className="rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-bone"
          >
            Upload
          </NavLink>
        </div>
      </header>
      <div className="lg:pl-80">
        <Outlet />
      </div>
    </div>
  );
}
