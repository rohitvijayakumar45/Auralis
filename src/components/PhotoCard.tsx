import { Archive, Download, Eye, Heart, MoreHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/cn";
import type { PhotoAsset } from "../types/domain";
import { ProgressiveImage } from "./ProgressiveImage";

export function PhotoCard({
  photo,
  view,
  onFavorite,
  onArchive,
  onDelete
}: {
  photo: PhotoAsset;
  view: "grid" | "list";
  onFavorite: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const actions = [
    { label: photo.isFavorite ? "Remove favorite" : "Favorite", icon: Heart, run: onFavorite },
    { label: photo.isArchived ? "Restore" : "Archive", icon: Archive, run: onArchive },
    { label: "Delete", icon: Trash2, run: onDelete }
  ];

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-charcoal/10 bg-bone shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-lift",
        view === "list" && "grid grid-cols-1 gap-0 md:grid-cols-[260px_1fr]"
      )}
    >
      <Link to={`/viewer/${photo.id}`} aria-label={`Open ${photo.title}`}>
        <ProgressiveImage
          src={photo.src}
          blurSrc={photo.blurSrc}
          alt={photo.title}
          className={cn(view === "grid" ? "aspect-[4/5]" : "aspect-[4/3] h-full")}
        />
      </Link>
      <div className="absolute left-4 top-4 flex translate-y-2 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <Link
          to={`/viewer/${photo.id}`}
          className="focus-ring rounded-full bg-bone/90 p-2 text-charcoal shadow-soft backdrop-blur"
          aria-label={`Preview ${photo.title}`}
        >
          <Eye className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onFavorite}
          className="focus-ring rounded-full bg-bone/90 p-2 text-charcoal shadow-soft backdrop-blur"
          aria-label={photo.isFavorite ? "Remove favorite" : "Add favorite"}
        >
          <Heart
            className={cn("h-4 w-4", photo.isFavorite && "fill-clay text-clay")}
          />
        </button>
      </div>
      <details className="absolute right-4 top-4">
        <summary className="focus-ring list-none rounded-full bg-bone/90 p-2 text-charcoal shadow-soft backdrop-blur marker:hidden">
          <MoreHorizontal className="h-4 w-4" />
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-charcoal/10 bg-bone p-2 text-sm shadow-lift">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.run}
              className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-charcoal hover:bg-charcoal/5"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </button>
          ))}
          <button className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-charcoal hover:bg-charcoal/5">
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </details>
      <div className={cn("p-5", view === "list" && "flex flex-col justify-center")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-charcoal">{photo.title}</h3>
            <p className="mt-1 text-sm text-charcoal/60">{photo.location}</p>
          </div>
          <span className="rounded-full bg-linen px-3 py-1 text-xs font-medium text-charcoal/65">
            {photo.camera}
          </span>
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-charcoal/62">
          {photo.description}
        </p>
      </div>
    </article>
  );
}
