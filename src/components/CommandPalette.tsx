import { Search, Settings, Star, Upload, Images, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/cn";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const commands = [
  { label: "Search the gallery", path: "/gallery", icon: Search },
  { label: "Upload photographs", path: "/upload", icon: Upload },
  { label: "Open albums", path: "/albums", icon: Images },
  { label: "View favorites", path: "/favorites", icon: Star },
  { label: "Profile and storage", path: "/profile", icon: UserRound },
  { label: "Settings", path: "/settings", icon: Settings }
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  useKeyboardShortcuts([
    {
      key: "k",
      meta: true,
      handler: () => setOpen((value) => !value)
    },
    {
      key: "Escape",
      handler: () => setOpen(false)
    }
  ]);

  const filtered = useMemo(
    () =>
      commands.filter((command) =>
        command.label.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 grid place-items-start bg-charcoal/30 px-4 py-24 backdrop-blur-sm"
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-charcoal/10 bg-bone shadow-lift"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-charcoal/10 px-5 py-4">
          <Search className="h-5 w-5 text-olive" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search actions, photos, albums"
            className="w-full bg-transparent text-lg text-charcoal outline-none placeholder:text-charcoal/40"
          />
          <kbd className="rounded-full border border-charcoal/10 px-2 py-1 text-xs text-charcoal/50">
            Esc
          </kbd>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-3">
          {filtered.map((command, index) => (
            <button
              key={command.path}
              type="button"
              onClick={() => {
                navigate(command.path);
                setOpen(false);
              }}
              className={cn(
                "focus-ring flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition hover:bg-charcoal/5",
                index === 0 && "bg-charcoal/[0.03]"
              )}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-linen text-olive">
                <command.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-charcoal">
                  {command.label}
                </span>
                <span className="text-sm text-charcoal/50">{command.path}</span>
              </span>
            </button>
          ))}
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-charcoal/55">
              No matching command. Try upload, favorites, or settings.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
