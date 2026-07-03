import { Grid2X2, List, Search } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { PhotoCard } from "../components/PhotoCard";
import { Button } from "../components/ui/Button";
import { usePhotoActions, usePhotos } from "../hooks/usePhotoData";
import { usePersistentSearchState } from "../hooks/useSearchState";

export function GalleryPage() {
  const [search, setSearch] = usePersistentSearchState();
  const { data: photos = [], isLoading } = usePhotos(search);
  const actions = usePhotoActions(search);

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-10">
      <header className="rounded-[2rem] bg-grain-wash p-6 shadow-soft md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-olive">
              Private gallery
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-none md:text-7xl">
              Search, curate, undo, and keep moving.
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {(["all", "favorites", "archive"] as const).map((filter) => (
              <Button
                key={filter}
                variant={search.filter === filter ? "charcoal" : "light"}
                onClick={() => setSearch({ filter })}
              >
                {filter[0].toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="flex items-center gap-3 rounded-full border border-charcoal/10 bg-bone px-5 py-3">
            <Search className="h-5 w-5 text-charcoal/45" />
            <input
              value={search.query}
              onChange={(event) => setSearch({ query: event.target.value })}
              placeholder="Search title, place, camera, tags"
              className="w-full bg-transparent outline-none placeholder:text-charcoal/40"
            />
          </label>
          <select
            value={search.sort}
            onChange={(event) =>
              setSearch({ sort: event.target.value as typeof search.sort })
            }
            className="focus-ring rounded-full border border-charcoal/10 bg-bone px-5 py-3"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name</option>
          </select>
          <div className="flex rounded-full border border-charcoal/10 bg-bone p-1">
            <button
              className="focus-ring rounded-full p-3"
              onClick={() => setSearch({ view: "grid" })}
              aria-label="Grid view"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              className="focus-ring rounded-full p-3"
              onClick={() => setSearch({ view: "list" })}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <section className="py-10">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-[2rem] bg-linen"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <EmptyState
            title="Nothing matches yet"
            body="Adjust your search or upload a new set. Empty states should still feel considered."
            action="Upload photos"
          />
        ) : (
          <div
            className={
              search.view === "grid"
                ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                : "space-y-5"
            }
          >
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                view={search.view}
                onFavorite={() =>
                  actions.favorite.mutate({
                    id: photo.id,
                    value: !photo.isFavorite
                  })
                }
                onArchive={() =>
                  actions.archive.mutate({
                    id: photo.id,
                    value: !photo.isArchived
                  })
                }
                onDelete={() => actions.remove.mutate(photo.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
