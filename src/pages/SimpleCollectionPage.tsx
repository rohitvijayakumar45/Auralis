import { Settings, Star, UserRound, Images } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { ProgressiveImage } from "../components/ProgressiveImage";
import { useAlbums, useCurrentUser, usePhotos, useDashboardStats, useSettings, useUpdateSettings } from "../hooks/usePhotoData";
import { useServices } from "../hooks/useServices";
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

      {kind === "profile" ? (
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
          <DashboardStats />
        </section>
      ) : null}

      {kind === "settings" ? (
        <SettingsView />
      ) : null}
    </div>
  );
}

function DashboardStats() {
  const { data: stats } = useDashboardStats();
  const services = useServices();
  if (!stats) return null;
  return (
    <article className="rounded-[2rem] bg-charcoal p-8 text-bone shadow-soft flex flex-col justify-between">
      <div>
        <h2 className="font-serif text-4xl font-semibold">Dashboard</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-bone/60">Photos</p>
            <p className="text-2xl font-semibold">{stats.photoCount}</p>
          </div>
          <div>
            <p className="text-sm text-bone/60">Albums</p>
            <p className="text-2xl font-semibold">{stats.albumCount}</p>
          </div>
          <div>
            <p className="text-sm text-bone/60">Favorites</p>
            <p className="text-2xl font-semibold">{stats.favoriteCount}</p>
          </div>
          <div>
            <p className="text-sm text-bone/60">Storage</p>
            <p className="text-2xl font-semibold">{(stats.storageUsedBytes / 1_073_741_824).toFixed(2)} GB</p>
          </div>
        </div>
      </div>
      <button 
        onClick={() => services.auth.logout()} 
        className="mt-6 self-start rounded-full bg-bone px-5 py-2 text-sm font-semibold text-charcoal hover:bg-ivory"
      >
        Sign out
      </button>
    </article>
  );
}

function SettingsView() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  if (!settings) return null;

  return (
    <section className="mt-8 max-w-2xl">
      <div className="rounded-[2rem] bg-bone p-8 shadow-soft space-y-6">
        <div>
          <label className="block text-sm font-medium text-charcoal/70">Theme</label>
          <select 
            value={settings.theme} 
            onChange={e => updateSettings.mutate({ theme: e.target.value })}
            className="mt-2 block w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-3"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70">Gallery Density</label>
          <select 
            value={settings.galleryDensity} 
            onChange={e => updateSettings.mutate({ galleryDensity: e.target.value })}
            className="mt-2 block w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-3"
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70">Sort Order</label>
          <select 
            value={settings.sortOrder} 
            onChange={e => updateSettings.mutate({ sortOrder: e.target.value })}
            className="mt-2 block w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-3"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
    </section>
  );
}
