import { Star } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { ProgressiveImage } from "../components/ProgressiveImage";
import { usePhotos } from "../hooks/usePhotoData";
import { parseSearchState } from "../lib/searchState";

const copy = {
  favorites: {
    icon: Star,
    title: "Favorites stay close.",
    body: "Optimistic favorite changes update immediately and can be undone."
  }
};

export function SimpleCollectionPage({
  kind
}: {
  kind: keyof typeof copy;
}) {
  const content = copy[kind];
  const { data: favoritePhotosData } = usePhotos({
    ...parseSearchState(new URLSearchParams()),
    filter: "favorites"
  });
  const favoritePhotos = favoritePhotosData?.pages.flatMap(p => p) ?? [];

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-10">
      <section className="rounded-[2.5rem] bg-grain-wash p-8 shadow-soft md:p-12">
        <content.icon className="h-9 w-9 text-olive" />
        <h1 className="mt-8 max-w-4xl font-serif text-5xl font-semibold leading-none md:text-7xl">
          {content.title}
        </h1>
        <p className="mt-6 max-w-2xl leading-7 text-charcoal/62">{content.body}</p>
      </section>

      {kind === "favorites" ? (
        favoritePhotos.length ? (
          <section className="mt-8 grid gap-5 md:grid-cols-3">
            {favoritePhotos.map((photo) => (
              <ProgressiveImage
                key={photo.id}
                src={photo.src}
                blurSrc={photo.blurSrc}
                alt={photo.title}
                className="aspect-[4/5] rounded-[2rem] shadow-soft"
              />
            ))}
          </section>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="No favorites yet"
              body="Favorite a photograph and it will appear in this quiet working set."
            />
          </div>
        )
      ) : null}
    </div>
  );
}
