import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export function ShortcutLayer() {
  const navigate = useNavigate();
  useKeyboardShortcuts([
    { key: "u", handler: () => navigate("/upload") },
    { key: "/", handler: () => navigate("/gallery") },
    { key: "f", handler: () => navigate("/favorites") },
    { key: "g", handler: () => navigate("/gallery") },
    {
      key: "?",
      shift: true,
      handler: () =>
        toast("Shortcuts", {
          description: "Cmd/Ctrl K, U upload, / gallery, F favorites, Esc close."
        })
    }
  ]);
  return null;
}
