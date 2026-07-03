import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Images, Plus, MoreVertical, Pencil, Trash2, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAlbums, useAlbumActions } from "../hooks/usePhotoData";
import { EmptyState } from "../components/EmptyState";
import { ProgressiveImage } from "../components/ProgressiveImage";

export function AlbumsPage() {
  const { data: albums = [] } = useAlbums();
  const { create, remove, rename } = useAlbumActions();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<{ id: string, title: string } | null>(null);
  const [deletingAlbum, setDeletingAlbum] = useState<{ id: string, title: string } | null>(null);

  const filteredAlbums = useMemo(() => {
    let result = [...albums];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      if (sort === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "most_photos") return b.photoIds.length - a.photoIds.length;
      return 0;
    });
    return result;
  }, [albums, query, sort]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    if (!title.trim()) return;
    
    try {
      const newAlbum = await create.mutateAsync({ title, description });
      setIsCreateModalOpen(false);
      navigate(`/albums/${newAlbum.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAlbum) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    if (!title.trim()) return;
    
    await rename.mutateAsync({ id: editingAlbum.id, title });
    setEditingAlbum(null);
  };

  const handleDelete = async () => {
    if (!deletingAlbum) return;
    await remove.mutateAsync(deletingAlbum.id);
    setDeletingAlbum(null);
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-10 pb-32">
      <section className="flex flex-col gap-6 md:flex-row md:items-end justify-between rounded-[2.5rem] bg-grain-wash p-8 shadow-soft md:p-12">
        <div>
          <Images className="h-9 w-9 text-olive" />
          <h1 className="mt-8 max-w-4xl font-serif text-5xl font-semibold leading-none md:text-7xl">
            Albums that feel edited, not dumped.
          </h1>
          <p className="mt-6 max-w-2xl leading-7 text-charcoal/62">
            Organize your memories into beautiful collections.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-olive px-6 py-4 font-semibold text-bone transition hover:scale-105 hover:bg-olive/90"
        >
          <Plus className="h-5 w-5" />
          New Album
        </button>
      </section>

      {albums.length > 0 && (
        <section className="mt-8 flex flex-col gap-4 md:flex-row md:items-center justify-between px-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/40" />
            <input
              type="text"
              placeholder="Search albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border-none bg-bone py-3 pl-12 pr-4 text-sm font-medium shadow-soft outline-none placeholder:text-charcoal/40 focus:ring-2 focus:ring-olive"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-charcoal/60">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border-none bg-bone py-2 pl-4 pr-10 text-sm font-semibold shadow-soft outline-none focus:ring-2 focus:ring-olive"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Alphabetical</option>
              <option value="most_photos">Most photos</option>
            </select>
          </div>
        </section>
      )}

      {albums.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            title="No albums yet"
            body="Create your first collection to organize your memories."
          />
          <div className="mt-8 flex justify-center">
             <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-charcoal px-6 py-4 font-semibold text-bone transition hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Create Album
            </button>
          </div>
        </div>
      ) : filteredAlbums.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            title="No matches found"
            body="Try adjusting your search query."
          />
        </div>
      ) : (
        <section className="mt-8 grid gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filteredAlbums.map((album) => {
            const coverSrc = album.coverPhotoSrc;
            return (
              <article
                key={album.id}
                className="group relative rounded-[2rem] bg-bone p-4 shadow-soft transition hover:-translate-y-1 flex flex-col"
              >
                <Link to={`/albums/${album.id}`} className="block aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-linen">
                  {coverSrc ? (
                    <ProgressiveImage
                      src={coverSrc}
                      blurSrc="https://picsum.photos/seed/auralis-blur/32/24"
                      alt={album.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-charcoal/20">
                      <Images className="h-12 w-12" />
                    </div>
                  )}
                </Link>
                <div className="mt-4 flex items-start justify-between gap-2 px-2 pb-2">
                  <div className="flex-1 overflow-hidden">
                    <Link to={`/albums/${album.id}`} className="block truncate text-lg font-semibold hover:underline">
                      {album.title}
                    </Link>
                    <p className="mt-1 truncate text-sm font-medium text-olive">
                      {album.photoIds.length} photograph{album.photoIds.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <AlbumMenu 
                    onRename={() => setEditingAlbum({ id: album.id, title: album.title })}
                    onDelete={() => setDeletingAlbum({ id: album.id, title: album.title })}
                  />
                </div>
              </article>
            );
          })}
        </section>
      )}

      <AnimatePresence>
        {isCreateModalOpen && (
          <ModalOverlay onClose={() => setIsCreateModalOpen(false)}>
            <form onSubmit={handleCreate} className="flex flex-col gap-6">
              <div>
                <h2 className="font-serif text-3xl font-semibold">New Album</h2>
                <p className="mt-2 text-charcoal/60">Create a new collection for your photos.</p>
              </div>
              <div className="flex flex-col gap-4">
                <input
                  name="title"
                  type="text"
                  placeholder="Album Title"
                  required
                  autoFocus
                  className="w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-4 font-medium outline-none focus:border-olive focus:ring-1 focus:ring-olive"
                />
                <textarea
                  name="description"
                  placeholder="Description (optional)"
                  rows={3}
                  className="w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-4 font-medium outline-none focus:border-olive focus:ring-1 focus:ring-olive"
                />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-full px-6 py-3 font-semibold text-charcoal/60 hover:bg-charcoal/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={create.isPending}
                  className="rounded-full bg-olive px-6 py-3 font-semibold text-bone transition hover:scale-105 disabled:opacity-50"
                >
                  {create.isPending ? "Creating..." : "Create Album"}
                </button>
              </div>
            </form>
          </ModalOverlay>
        )}

        {editingAlbum && (
          <ModalOverlay onClose={() => setEditingAlbum(null)}>
            <form onSubmit={handleRename} className="flex flex-col gap-6">
              <div>
                <h2 className="font-serif text-3xl font-semibold">Rename Album</h2>
              </div>
              <input
                name="title"
                type="text"
                defaultValue={editingAlbum.title}
                required
                autoFocus
                className="w-full rounded-2xl border border-charcoal/10 bg-ivory px-4 py-4 font-medium outline-none focus:border-olive focus:ring-1 focus:ring-olive"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  className="rounded-full px-6 py-3 font-semibold text-charcoal/60 hover:bg-charcoal/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rename.isPending}
                  className="rounded-full bg-olive px-6 py-3 font-semibold text-bone transition hover:scale-105 disabled:opacity-50"
                >
                  {rename.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </ModalOverlay>
        )}

        {deletingAlbum && (
          <ModalOverlay onClose={() => setDeletingAlbum(null)}>
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-red-600">Delete Album?</h2>
                <p className="mt-2 leading-relaxed text-charcoal/70">
                  Are you sure you want to delete <strong>"{deletingAlbum.title}"</strong>? 
                  Your photos will not be deleted, but this collection will be permanently removed.
                </p>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setDeletingAlbum(null)}
                  className="rounded-full px-6 py-3 font-semibold text-charcoal/60 hover:bg-charcoal/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={remove.isPending}
                  className="rounded-full bg-red-600 px-6 py-3 font-semibold text-bone transition hover:scale-105 disabled:opacity-50"
                >
                  {remove.isPending ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlbumMenu({ onRename, onDelete }: { onRename: () => void, onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="rounded-full p-2 text-charcoal/40 transition hover:bg-charcoal/5 hover:text-charcoal"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-2xl bg-bone p-1 shadow-soft ring-1 ring-charcoal/5"
          >
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); onRename(); }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-charcoal transition hover:bg-charcoal/5"
            >
              <Pencil className="h-4 w-4" />
              Rename
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); onDelete(); }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete Album
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ModalOverlay({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg rounded-[2.5rem] bg-bone p-8 shadow-2xl md:p-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
