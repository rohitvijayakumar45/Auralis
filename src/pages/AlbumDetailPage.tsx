import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Images, Plus, X, Search, Check } from "lucide-react";
import { useAlbum, useAlbumActions, usePhotos, usePhotoActions } from "../hooks/usePhotoData";
import { EmptyState } from "../components/EmptyState";
import { ProgressiveImage } from "../components/ProgressiveImage";
import { PhotoCard } from "../components/PhotoCard";
import { ModalOverlay } from "./AlbumsPage";

export function AlbumDetailPage() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { data: album, isLoading: albumLoading } = useAlbum(albumId!);
  const { removePhotos } = useAlbumActions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch photos that belong to this album
  const { data: albumPhotosPages, isLoading: photosLoading } = usePhotos({
    query: "",
    filter: "all",
    sort: "newest",
    view: "grid",
    albumId
  });

  const { favorite, archive, remove } = usePhotoActions({
    query: "",
    filter: "all",
    sort: "newest",
    view: "grid",
    albumId
  });

  const photos = albumPhotosPages?.pages.flatMap(p => p) || [];
  const coverPhoto = photos.find(p => p.id === album?.coverPhotoId) || photos[0];

  if (albumLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-medium text-charcoal/40">Loading album...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="font-medium text-charcoal/60">Album not found</p>
        <button onClick={() => navigate("/albums")} className="text-olive hover:underline">
          Return to Albums
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-10 pb-32">
      <Link to="/albums" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-charcoal/60 hover:text-charcoal transition">
        <ArrowLeft className="h-4 w-4" />
        Back to Albums
      </Link>

      <section className="relative overflow-hidden rounded-[2.5rem] bg-charcoal p-8 shadow-soft md:p-12 min-h-[40vh] flex flex-col justify-end">
        {coverPhoto && (
          <div className="absolute inset-0 z-0 opacity-40">
            <ProgressiveImage
              src={coverPhoto.src}
              blurSrc={coverPhoto.blurSrc}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
          </div>
        )}
        <div className="relative z-10">
          <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-none md:text-7xl text-bone">
            {album.title}
          </h1>
          {album.description && (
            <p className="mt-6 max-w-2xl leading-7 text-bone/80">
              {album.description}
            </p>
          )}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-olive px-6 py-3 font-semibold text-bone transition hover:scale-105 hover:bg-olive/90 shadow-soft"
            >
              <Plus className="h-5 w-5" />
              Add Photos
            </button>
            <p className="text-sm font-medium text-bone/60">
              {photos.length} photograph{photos.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {photosLoading ? (
          <p className="mt-12 text-center text-charcoal/40">Loading photos...</p>
        ) : photos.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="This album is empty"
              body="Add some beautiful photographs to complete this collection."
            />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                view="grid"
                onFavorite={() => favorite.mutate({ id: photo.id, value: !photo.isFavorite })}
                onArchive={() => archive.mutate({ id: photo.id, value: !photo.isArchived })}
                onDelete={() => remove.mutate(photo.id)}
                customActions={[
                  { 
                    label: "Remove from Album", 
                    icon: X, 
                    danger: true,
                    run: () => removePhotos.mutate({ id: album.id, photoIds: [photo.id] })
                  }
                ]}
              />
            ))}
          </div>
        )}
      </section>

      {isAddModalOpen && (
        <AddPhotosModal albumId={album.id} existingPhotoIds={album.photoIds} onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
}

function AddPhotosModal({ albumId, existingPhotoIds, onClose }: { albumId: string, existingPhotoIds: string[], onClose: () => void }) {
  const { addPhotos } = useAlbumActions();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const { data: allPhotosPages, isLoading } = usePhotos({
    query,
    filter: "all",
    sort: "newest",
    view: "grid"
  });

  const allPhotos = allPhotosPages?.pages.flatMap(p => p) || [];
  // Only show photos that are not already in the album
  const selectablePhotos = allPhotos.filter(p => !existingPhotoIds.includes(p.id));

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSave = async () => {
    if (selectedIds.size === 0) {
      onClose();
      return;
    }
    await addPhotos.mutateAsync({ id: albumId, photoIds: Array.from(selectedIds) });
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex h-[80vh] flex-col">
        <div className="mb-6 shrink-0">
          <h2 className="font-serif text-3xl font-semibold">Add Photos</h2>
          <p className="mt-2 text-charcoal/60">Select photos to add to this album.</p>
        </div>

        <div className="relative mb-6 shrink-0">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            placeholder="Search your library..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-charcoal/10 bg-ivory py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-olive focus:ring-1 focus:ring-olive"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0 relative">
          {isLoading ? (
            <p className="text-center text-charcoal/40 mt-10">Loading photos...</p>
          ) : selectablePhotos.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-charcoal/40">
              <Images className="h-12 w-12 mb-4" />
              <p>No new photos available to add.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {selectablePhotos.map(photo => {
                const isSelected = selectedIds.has(photo.id);
                return (
                  <button
                    key={photo.id}
                    onClick={() => toggleSelection(photo.id)}
                    className="group relative aspect-square overflow-hidden rounded-2xl border-2 transition-all focus:outline-none"
                    style={{ borderColor: isSelected ? 'var(--olive)' : 'transparent' }}
                  >
                    <ProgressiveImage
                      src={photo.src}
                      blurSrc={photo.blurSrc}
                      alt={photo.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className={`absolute inset-0 bg-charcoal/20 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    {isSelected && (
                      <div className="absolute right-2 top-2 rounded-full bg-olive p-1 text-bone shadow-soft">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex shrink-0 justify-end gap-3 pt-4 border-t border-charcoal/5">
          <button
            onClick={onClose}
            className="rounded-full px-6 py-3 font-semibold text-charcoal/60 hover:bg-charcoal/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={addPhotos.isPending || selectedIds.size === 0}
            className="rounded-full bg-olive px-6 py-3 font-semibold text-bone transition hover:scale-105 disabled:opacity-50 flex items-center gap-2"
          >
            {addPhotos.isPending ? "Adding..." : `Add ${selectedIds.size} Photo${selectedIds.size === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
