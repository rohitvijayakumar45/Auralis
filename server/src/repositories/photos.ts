import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db/pool.js";

type SearchInput = {
  query: string;
  filter: string;
  sort: string;
  limit?: number;
  offset?: number;
  albumId?: string;
};

function orderBy(sort: string) {
  if (sort === "oldest") return "captured_at ASC, created_at ASC";
  if (sort === "name") return "title ASC";
  return "captured_at DESC, created_at DESC";
}

export async function listPhotos(userId: string, search: SearchInput) {
  const conditions = ["user_id = :userId", "is_deleted = FALSE"];
  const params: Record<string, any> = { userId };
  if (search.filter === "favorites") conditions.push("is_favorite = TRUE");
  if (search.filter === "archive") conditions.push("is_archived = TRUE");
  if (search.albumId) {
    conditions.push("id IN (SELECT photo_id FROM album_photos WHERE album_id = :albumId)");
    params.albumId = search.albumId;
  }
  if (search.query) {
    conditions.push(
      "(title LIKE :query OR description LIKE :query OR location LIKE :query OR camera LIKE :query)"
    );
    params.query = `%${search.query}%`;
  }
  
  const limit = Math.min(Math.max(search.limit ?? 50, 1), 200);
  const offset = Math.max(search.offset ?? 0, 0);

  const [rows] = await pool.execute(
    `SELECT * FROM photos WHERE ${conditions.join(" AND ")}
     ORDER BY ${orderBy(search.sort)} LIMIT ${limit} OFFSET ${offset}`,
    params
  );
  return rows;
}

export async function getPhoto(userId: string, id: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM photos WHERE user_id = :userId AND id = :id LIMIT 1",
    { userId, id }
  );
  return (rows as RowDataPacket[])[0];
}

export async function createPhoto(input: {
  userId: string;
  title: string;
  description?: string;
  camera?: string;
  fileSize?: number;
  storageKey: string;
  thumbnailKey?: string;
}) {
  const id = randomUUID();
  await pool.execute(
    `INSERT INTO photos
      (id, user_id, title, description, storage_key, thumbnail_key, captured_at, location, camera, file_size)
     VALUES
      (:id, :userId, :title, :description, :storageKey, :thumbnailKey, NOW(), :location, :camera, :fileSize)`,
    {
      id,
      userId: input.userId,
      title: input.title,
      description: input.description || "Uploaded to Auralis and ready for curation.",
      storageKey: input.storageKey,
      thumbnailKey: input.thumbnailKey ?? null,
      location: "Imported",
      camera: input.camera || "Unknown",
      fileSize: input.fileSize || 0
    }
  );
  return getPhoto(input.userId, id);
}

export async function patchPhotoFlag(
  userId: string,
  id: string,
  field: "is_favorite" | "is_archived" | "is_deleted",
  value: boolean
) {
  await pool.execute(
    `UPDATE photos SET ${field} = :value WHERE user_id = :userId AND id = :id`,
    { userId, id, value }
  );
  return getPhoto(userId, id);
}

export async function renamePhoto(userId: string, id: string, title: string) {
  await pool.execute(
    "UPDATE photos SET title = :title WHERE user_id = :userId AND id = :id",
    { userId, id, title }
  );
  return getPhoto(userId, id);
}

export async function getAlbum(userId: string, id: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT a.id, a.title, a.description, a.cover_photo_id AS coverPhotoId, a.updated_at AS updatedAt, IFNULL(GROUP_CONCAT(ap.photo_id), '') AS photoIdsString
     FROM albums a LEFT JOIN album_photos ap ON a.id = ap.album_id
     WHERE a.user_id = :userId AND a.id = :id
     GROUP BY a.id LIMIT 1`,
    { userId, id }
  );
  if (!rows[0]) return undefined;
  return {
    ...rows[0],
    photoIds: rows[0].photoIdsString ? rows[0].photoIdsString.split(",") : []
  };
}

export async function listAlbums(userId: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT a.id, a.title, a.description, a.cover_photo_id AS coverPhotoId, a.updated_at AS updatedAt, 
            IFNULL(GROUP_CONCAT(ap.photo_id), '') AS photoIdsString,
            (SELECT storage_key FROM photos WHERE id = COALESCE(a.cover_photo_id, (SELECT photo_id FROM album_photos WHERE album_id = a.id LIMIT 1))) AS coverStorageKey
     FROM albums a LEFT JOIN album_photos ap ON a.id = ap.album_id
     WHERE a.user_id = :userId
     GROUP BY a.id
     ORDER BY a.updated_at DESC`,
    { userId }
  );
  return rows.map(row => ({
    ...row,
    photoIds: row.photoIdsString ? row.photoIdsString.split(",") : [],
    coverStorageKey: row.coverStorageKey || null
  }));
}

export async function createAlbum(userId: string, title: string, description: string = "") {
  const id = randomUUID();
  await pool.execute(
    "INSERT INTO albums (id, user_id, title, description) VALUES (:id, :userId, :title, :description)",
    { id, userId, title, description }
  );
  return { id, title, description, coverPhotoId: null, photoIds: [], updatedAt: new Date().toISOString() };
}

export async function renameAlbum(userId: string, id: string, title: string) {
  await pool.execute(
    "UPDATE albums SET title = :title WHERE user_id = :userId AND id = :id",
    { userId, id, title }
  );
  return { success: true };
}

export async function deleteAlbum(userId: string, id: string) {
  await pool.execute("DELETE FROM album_photos WHERE album_id = :id", { id });
  await pool.execute("DELETE FROM albums WHERE user_id = :userId AND id = :id", { userId, id });
  return { success: true };
}

export async function addPhotosToAlbum(userId: string, albumId: string, photoIds: string[]) {
  for (const photoId of photoIds) {
    await pool.execute(
      "INSERT IGNORE INTO album_photos (album_id, photo_id) VALUES (:albumId, :photoId)",
      { albumId, photoId }
    );
  }
  return { success: true };
}

export async function removePhotosFromAlbum(userId: string, albumId: string, photoIds: string[]) {
  for (const photoId of photoIds) {
    await pool.execute(
      "DELETE FROM album_photos WHERE album_id = :albumId AND photo_id = :photoId",
      { albumId, photoId }
    );
  }
  return { success: true };
}

export async function getDashboardStats(userId: string) {
  const [photos] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as count, SUM(IFNULL(file_size, IFNULL(width * height * 3, 0))) as storage FROM photos WHERE user_id = :userId AND is_deleted = FALSE", { userId });
  const [albums] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM albums WHERE user_id = :userId", { userId });
  const [favorites] = await pool.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM photos WHERE user_id = :userId AND is_favorite = TRUE AND is_deleted = FALSE", { userId });
  return {
    photoCount: Number(photos[0]?.count ?? 0),
    storageUsedBytes: Number(photos[0]?.storage ?? 0),
    albumCount: Number(albums[0]?.count ?? 0),
    favoriteCount: Number(favorites[0]?.count ?? 0)
  };
}
