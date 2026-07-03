import { Archive, ArrowLeft, Heart, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ProgressiveImage } from "../components/ProgressiveImage";
import { Button } from "../components/ui/Button";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { usePhoto, usePhotoActions } from "../hooks/usePhotoData";
import { parseSearchState } from "../lib/searchState";

export function ViewerPage() {
  const { photoId = "" } = useParams();
  const navigate = useNavigate();
  const { data: photo, isLoading } = usePhoto(photoId);
  const actions = usePhotoActions(parseSearchState(new URLSearchParams()));

  useKeyboardShortcuts([
    { key: "Escape", handler: () => navigate("/gallery") },
    {
      key: "f",
      handler: () =>
        photo &&
        actions.favorite.mutate({ id: photo.id, value: !photo.isFavorite })
    },
    { key: "Delete", handler: () => photo && actions.remove.mutate(photo.id) }
  ]);

  if (isLoading) {
    return <div className="min-h-screen animate-pulse bg-linen" />;
  }

  if (!photo) {
    return (
      <div className="p-8">
        <EmptyState
          title="This photograph is unavailable"
          body="It may have been deleted, archived, or moved by another session."
          action="Return to gallery"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal p-4 text-bone md:p-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/gallery"
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-bone/10 px-4 py-2 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Gallery
        </Link>
        <div className="flex gap-2">
          <Button
            variant="light"
            onClick={() =>
              actions.favorite.mutate({
                id: photo.id,
                value: !photo.isFavorite
              })
            }
          >
            <Heart className="mr-2 h-4 w-4" />
            {photo.isFavorite ? "Favorited" : "Favorite"}
          </Button>
          <Button
            variant="light"
            onClick={() =>
              actions.archive.mutate({
                id: photo.id,
                value: !photo.isArchived
              })
            }
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
          <Button variant="light" onClick={() => actions.remove.mutate(photo.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </header>
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <ProgressiveImage
          src={photo.src}
          blurSrc={photo.blurSrc}
          alt={photo.title}
          className="max-h-[calc(100vh-8rem)] min-h-[520px] rounded-[2rem]"
        />
        <aside className="rounded-[2rem] border border-bone/10 bg-bone/8 p-6 backdrop-blur">
          <h1 className="font-serif text-4xl font-semibold">{photo.title}</h1>
          <p className="mt-4 leading-7 text-bone/65">{photo.description}</p>
          <dl className="mt-8 space-y-5 text-sm">
            <div>
              <dt className="text-bone/40">Location</dt>
              <dd className="mt-1 font-medium">{photo.location}</dd>
            </div>
            <div>
              <dt className="text-bone/40">Camera</dt>
              <dd className="mt-1 font-medium">{photo.camera}</dd>
            </div>
            <div>
              <dt className="text-bone/40">Storage key</dt>
              <dd className="mt-1 break-all font-mono text-xs">{photo.storageKey}</dd>
            </div>
            <div>
              <dt className="text-bone/40">Thumbnail key</dt>
              <dd className="mt-1 break-all font-mono text-xs">
                {photo.thumbnailKey}
              </dd>
            </div>
          </dl>
        </aside>
      </section>
    </div>
  );
}
