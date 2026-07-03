import { randomUUID } from "node:crypto";
import { pool } from "../db/pool.js";

type SearchInput = {
  query: string;
  filter: string;
  sort: string;
};

function orderBy(sort: string) {
  if (sort === "oldest") return "captured_at ASC, created_at ASC";
  if (sort === "name") return "title ASC";
  return "captured_at DESC, created_at DESC";
}

export async function listPhotos(userId: string, search: SearchInput) {
  const conditions = ["user_id = :userId", "is_deleted = FALSE"];
  const params: Record<string, string> = { userId };
  if (search.filter === "favorites") conditions.push("is_favorite = TRUE");
  if (search.filter === "archive") conditions.push("is_archived = TRUE");
  if (search.query) {
    conditions.push(
      "(title LIKE :query OR description LIKE :query OR location LIKE :query OR camera LIKE :query)"
    );
    params.query = `%${search.query}%`;
  }
  const [rows] = await pool.execute(
    `SELECT * FROM photos WHERE ${conditions.join(" AND ")}
     ORDER BY ${orderBy(search.sort)} LIMIT 200`,
    params
  );
  return rows;
}

export async function getPhoto(userId: string, id: string) {
  const [rows] = await pool.execute(
    "SELECT * FROM photos WHERE user_id = :userId AND id = :id LIMIT 1",
    { userId, id }
  );
  return Array.isArray(rows) ? rows[0] : undefined;
}

export async function createPhoto(input: {
  userId: string;
  title: string;
  storageKey: string;
  thumbnailKey?: string;
}) {
  const id = randomUUID();
  await pool.execute(
    `INSERT INTO photos
      (id, user_id, title, description, storage_key, thumbnail_key, captured_at, location, camera)
     VALUES
      (:id, :userId, :title, :description, :storageKey, :thumbnailKey, NOW(), :location, :camera)`,
    {
      id,
      userId: input.userId,
      title: input.title,
      description: "Uploaded to Auralis and ready for curation.",
      storageKey: input.storageKey,
      thumbnailKey: input.thumbnailKey ?? null,
      location: "Imported",
      camera: "Unknown"
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

export async function listAlbums(userId: string) {
  const [rows] = await pool.execute(
    `SELECT id, title, description, cover_photo_id AS coverPhotoId, updated_at AS updatedAt
     FROM albums WHERE user_id = :userId ORDER BY updated_at DESC`,
    { userId }
  );
  return rows;
}
