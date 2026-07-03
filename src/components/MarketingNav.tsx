import { Link } from "react-router-dom";
import { Button } from "./ui/Button";

export function MarketingNav() {
  return (
    <header className="fixed left-0 right-0 top-5 z-40 px-4">
      <nav className="glass-nav mx-auto flex max-w-5xl items-center justify-between rounded-full px-4 py-3 shadow-soft">
        <Link to="/" className="flex items-center gap-3 text-charcoal">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-charcoal text-sm font-semibold text-bone">
            A
          </span>
          <span className="font-serif text-2xl font-semibold">Auralis</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-charcoal/65 md:flex">
          <a href="#gallery">Gallery</a>
          <a href="#motion">Workflow</a>
          <a href="#stories">Stories</a>
        </div>
        <Link to="/login">
          <Button variant="charcoal" className="px-4 py-2">
            Enter gallery
          </Button>
        </Link>
      </nav>
    </header>
  );
}
