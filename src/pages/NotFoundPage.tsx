import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bone p-8">
      <EmptyState
        title="This room is not in the archive"
        body="The route may have changed, or the collection may have been moved."
      />
      <div className="mt-8 text-center">
        <Link
          to="/gallery"
          className="focus-ring inline-flex rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-bone"
        >
          Return to gallery
        </Link>
      </div>
    </div>
  );
}
