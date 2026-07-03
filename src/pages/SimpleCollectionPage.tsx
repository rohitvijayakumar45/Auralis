import { Settings, Star, UserRound, Images } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { ProgressiveImage } from "../components/ProgressiveImage";
import { useAlbums, useCurrentUser, usePhotos } from "../hooks/usePhotoData";
import { parseSearchState } from "../lib/searchState";

const copy = {
  albums: {
    icon: Images,
    title: "Albums that feel edited, not dumped.",
    body: "Collections are ready for RDS-backed metadata and S3 cover imagery."
  },
  favorites: {
    icon: Star,
    title: "Favorites stay close.",
    body: "Optimistic favorite changes update immediately and can be undone."
  },
  profile: {
    icon: UserRound,
    title: "A calm account surface.",
    body: "Storage analytics, identity, and account data will later map cleanly to Cognito and backend APIs."
  },
  settings: {
    icon: Settings,
    title: "Settings without clutter.",
    body: "Preferences, reduced motion, privacy controls, and export tools belong here."
  }
};

export function SimpleCollectionPage({
  kind
}: {
  kind: keyof typeof copy;
}) {
  const content = copy[kind];
  const { data: albums = [] } = useAlbums();
  const { data: user } = useCurrentUser();
  const { data: favoritePhotos = [] } = usePhotos({
    ...parseSearchState(new URLSearchParams()),
    filter: "favorites"
  });

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-10">
      <section className="rounded-[2.5rem] bg-grain-wash p-8 shadow-soft md:p-12">
        <content.icon className="h-9 w-9 text-olive" />
        <h1 className="mt-8 max-w-4xl font-serif text-5xl font-semibold leading-none md:text-7xl">
          {content.title}
        </h1>
        <p className="mt-6 max-w-2xl leading-7 text-charcoal/62">{content.body}</p>
      </section>

      {kind === "albums" ? (
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {albums.map((album) => (
            <article
              key={album.id}
              className="rounded-[2rem] bg-bone p-5 shadow-soft transition hover:-translate-y-1"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-linen">
                <img
                  src={`https://picsum.photos/seed/${album.id}/900/700`}
                  alt=""
                  className="h-full w-full object-cover grayscale transition duration-700 hover:scale-105"
                />
              </div>
              <h2 className="mt-5 text-2xl font-semibold">{album.title}</h2>
              <p className="mt-2 text-sm leading-6 text-charcoal/60">
                {album.description}
              </p>
              <p className="mt-5 text-sm font-medium text-olive">
                {album.photoIds.length} photographs
              </p>
            </article>
          ))}
        </section>
      ) : null}

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

      {kind === "profile" || kind === "settings" ? (
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-[2rem] bg-bone p-8 shadow-soft">
            <h2 className="font-serif text-4xl font-semibold">
              {user?.name ?? "Loading profile"}
            </h2>
            <p className="mt-4 text-charcoal/62">{user?.email}</p>
            <div className="mt-8 h-3 overflow-hidden rounded-full bg-linen">
              <div
                className="h-full rounded-full bg-olive"
                style={{
                  width: user
                    ? `${Math.round((user.storageUsedGb / user.storageLimitGb) * 100)}%`
                    : "0%"
                }}
              />
            </div>
          </article>
          <article className="rounded-[2rem] bg-charcoal p-8 text-bone shadow-soft">
            <h2 className="font-serif text-4xl font-semibold">Cloud readiness</h2>
            <p className="mt-4 leading-7 text-bone/65">
              Cognito identity, S3 storage, Lambda thumbnails, RDS metadata, and
              Express transport can replace the adapters behind the same UI
              contract.
            </p>
          </article>
        </section>
      ) : null}
    </div>
  );
}
