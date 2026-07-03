function slugFileName(fileName: string) {
  const trimmed = fileName.trim().toLowerCase();
  const extension = trimmed.match(/\.[a-z0-9]+$/)?.[0] ?? "";
  const base = trimmed
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "photo"}${extension}`;
}

export function buildPhotoStorageKey(
  userId: string,
  fileName: string,
  assetId: string = crypto.randomUUID()
) {
  return `users/${userId}/photos/${assetId}-${slugFileName(fileName)}`;
}

export function buildThumbnailStorageKey(userId: string, assetId: string) {
  return `users/${userId}/thumbnails/${assetId}.webp`;
}
