import { ArrowRight, CheckCircle2, HardDrive, Images, Upload, Library, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProgressiveImage } from "../components/ProgressiveImage";
import { useCurrentUser, useDashboardStats, useAlbums, photoKeys } from "../hooks/usePhotoData";
import { useServices } from "../hooks/useServices";
import type { PhotoAsset } from "../types/domain";

export function DashboardPage() {
  const services = useServices();
  const { data: user } = useCurrentUser();
  const { data: stats, isSuccess: statsSuccess } = useDashboardStats();
  const { data: albums, isSuccess: albumsSuccess } = useAlbums();
  
  const { data: recentPhotos, isSuccess: photosSuccess } = useQuery({
    queryKey: [...photoKeys.all, "dashboard-recent"],
    queryFn: () => services.metadata.listPhotos({ query: "", filter: "all", sort: "newest", limit: 6, offset: 0, view: "grid" })
  });

  const { data: favoritePhotos } = useQuery({
    queryKey: [...photoKeys.all, "dashboard-favorites"],
    queryFn: () => services.metadata.listPhotos({ query: "", filter: "favorites", sort: "newest", limit: 4, offset: 0, view: "grid" })
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const isHealthy = statsSuccess && albumsSuccess && photosSuccess;

  // Synthesize recent activity timeline
  const activities = [
    ...(recentPhotos?.slice(0, 5).map((p: PhotoAsset) => ({ type: "photo", label: `Uploaded ${p.title}`, date: new Date(p.createdAt), id: p.id })) || []),
    ...(albums?.slice(0, 3).map((a: any) => ({ type: "album", label: `Created album "${a.title}"`, date: new Date(a.updatedAt), id: a.id })) || [])
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

  return (
    <div className="min-h-screen bg-bone p-4 md:p-8">
      {/* Hero Section */}
      <section className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold md:text-5xl">
            {getGreeting()}, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="mt-3 text-charcoal/60">
            Everything is synchronized across your private cloud.
          </p>
        </div>
        <div className="w-full rounded-3xl bg-ivory p-6 shadow-soft lg:w-80">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-xl font-medium">{user ? user.storageUsedGb.toFixed(2) : 0} GB <span className="text-sm font-normal text-charcoal/50">used</span></p>
              <p className="mt-1 text-xs text-charcoal/50">{user ? user.storageLimitGb : 128} GB total</p>
            </div>
            <p className="font-mono text-sm font-semibold text-olive">
              {user ? ((user.storageUsedGb / user.storageLimitGb) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-linen">
            <div
              className="h-full rounded-full bg-olive transition-all duration-1000"
              style={{ width: user ? `${(user.storageUsedGb / user.storageLimitGb) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Quick Statistics */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Photos", value: stats?.photoCount ?? "-", icon: Images },
              { label: "Albums", value: stats?.albumCount ?? "-", icon: Library },
              { label: "Favorites", value: stats?.favoriteCount ?? "-", icon: Star },
              { label: "Storage", value: stats ? formatBytes(stats.storageUsedBytes) : "-", icon: HardDrive },
            ].map((stat, i) => (
              <div key={i} className="rounded-3xl bg-ivory p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
                <stat.icon className="mb-4 h-5 w-5 text-charcoal/40" />
                <p className="font-serif text-3xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-charcoal/60">{stat.label}</p>
              </div>
            ))}
          </section>

          {/* Recent Uploads */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold">Recent Uploads</h2>
              <Link to="/gallery" className="flex items-center text-sm font-medium text-charcoal/60 hover:text-charcoal">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            {!recentPhotos?.length ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-3xl border border-dashed border-charcoal/20 bg-ivory">
                <p className="text-charcoal/50">No uploads yet.</p>
                <Link to="/upload" className="mt-2 text-sm font-medium hover:underline">Upload your first photos</Link>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {recentPhotos.map((photo: PhotoAsset) => (
                  <Link key={photo.id} to={`/viewer/${photo.id}`} className="group relative min-w-[160px] flex-1 shrink-0 overflow-hidden rounded-3xl shadow-soft">
                    <ProgressiveImage src={photo.src} blurSrc={photo.blurSrc} alt={photo.title} className="aspect-square" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                      <p className="truncate text-sm font-medium text-bone">{photo.title}</p>
                      <p className="text-xs text-bone/70">{new Date(photo.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Albums Overview */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold">Albums</h2>
              <Link to="/albums" className="flex items-center text-sm font-medium text-charcoal/60 hover:text-charcoal">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            {!albums?.length ? (
              <div className="flex h-32 items-center justify-center rounded-3xl border border-dashed border-charcoal/20 bg-ivory">
                <p className="text-charcoal/50">No albums created yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {albums.slice(0, 4).map((album: any) => {
                  const coverSrc = album.coverPhotoSrc;
                  return (
                    <Link key={album.id} to="/albums" className="group block overflow-hidden rounded-3xl shadow-soft">
                      {coverSrc ? (
                        <ProgressiveImage src={coverSrc} blurSrc="https://picsum.photos/seed/auralis-blur/32/24" alt={album.title} className="aspect-[4/3]" />
                      ) : (
                        <div className="aspect-[4/3] bg-linen" />
                      )}
                      <div className="bg-ivory p-4">
                        <p className="truncate font-semibold">{album.title}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Widgets */}
        <aside className="space-y-6">
          {/* Quick Actions */}
          <section className="rounded-3xl bg-ivory p-6 shadow-soft">
            <h3 className="mb-4 font-serif text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/upload" className="flex w-full items-center gap-3 rounded-2xl bg-charcoal/5 px-4 py-3 text-sm font-medium hover:bg-charcoal/10 transition">
                <Upload className="h-4 w-4" /> Upload Photos
              </Link>
              <Link to="/albums" className="flex w-full items-center gap-3 rounded-2xl bg-charcoal/5 px-4 py-3 text-sm font-medium hover:bg-charcoal/10 transition">
                <Library className="h-4 w-4" /> Manage Albums
              </Link>
              <Link to="/settings" className="flex w-full items-center gap-3 rounded-2xl bg-charcoal/5 px-4 py-3 text-sm font-medium hover:bg-charcoal/10 transition">
                <HardDrive className="h-4 w-4" /> Manage Storage
              </Link>
            </div>
          </section>

          {/* System Status */}
          <section className="rounded-3xl bg-ivory p-6 shadow-soft">
            <h3 className="mb-4 font-serif text-lg font-semibold">System Status</h3>
            <div className="space-y-3">
              {[
                { label: "AWS Sync", healthy: isHealthy },
                { label: "Database", healthy: isHealthy },
                { label: "Authentication", healthy: !!user }
              ].map(sys => (
                <div key={sys.label} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal/70">{sys.label}</span>
                  <span className={`flex items-center gap-1.5 font-medium ${sys.healthy ? 'text-olive' : 'text-charcoal/40'}`}>
                    {sys.healthy ? <><CheckCircle2 className="h-3 w-3" /> Healthy</> : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="rounded-3xl bg-ivory p-6 shadow-soft">
            <h3 className="mb-4 font-serif text-lg font-semibold">Recent Activity</h3>
            {!activities.length ? (
              <p className="text-sm text-charcoal/50">No recent activity.</p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-[7px] before:w-0.5 before:bg-charcoal/10">
                {activities.map(act => (
                  <div key={act.id + act.type} className="relative flex gap-4 text-sm">
                    <div className="relative z-10 mt-1.5 h-4 w-4 shrink-0 rounded-full border-2 border-ivory bg-charcoal/20" />
                    <div>
                      <p className="font-medium">{act.label}</p>
                      <p className="text-xs text-charcoal/50">{act.date.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Favorites */}
          <section className="rounded-3xl bg-ivory p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold">Favorites</h3>
              <Link to="/favorites" className="text-xs font-medium hover:underline">View all</Link>
            </div>
            {!favoritePhotos?.length ? (
              <p className="text-sm text-charcoal/50">No favorites yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {favoritePhotos.map((photo: PhotoAsset) => (
                  <Link key={photo.id} to={`/viewer/${photo.id}`} className="block overflow-hidden rounded-2xl">
                    <ProgressiveImage src={photo.src} blurSrc={photo.blurSrc} alt={photo.title} className="aspect-square" />
                  </Link>
                ))}
              </div>
            )}
          </section>

        </aside>
      </div>
    </div>
  );
}
