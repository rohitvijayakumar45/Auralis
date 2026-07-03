import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db/pool.js";
import type { AuthenticatedUser } from "../types.js";

type UserRow = RowDataPacket & {
  id: string;
  cognito_sub: string;
  name: string;
  email: string;
};

export async function upsertUserFromClaims(input: {
  sub: string;
  email: string;
  name: string;
}): Promise<AuthenticatedUser> {
  const [existing] = await pool.execute<UserRow[]>(
    "SELECT id, cognito_sub, name, email FROM users WHERE cognito_sub = :sub LIMIT 1",
    { sub: input.sub }
  );
  if (existing[0]) {
    return {
      sub: existing[0].cognito_sub,
      email: existing[0].email,
      name: existing[0].name,
      userId: existing[0].id
    };
  }

  const id = randomUUID();
  await pool.execute(
    `INSERT INTO users (id, cognito_sub, name, email, avatar_url)
     VALUES (:id, :sub, :name, :email, :avatarUrl)`,
    {
      id,
      sub: input.sub,
      name: input.name,
      email: input.email,
      avatarUrl: ""
    }
  );
  
  // Create default settings row
  await pool.execute(
    "INSERT IGNORE INTO user_settings (user_id) VALUES (:id)",
    { id }
  );
  
  return { sub: input.sub, email: input.email, name: input.name, userId: id };
}

export async function getUserProfile(userId: string) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, avatar_url AS avatarUrl,
            storage_used_bytes AS storageUsedBytes,
            storage_limit_bytes AS storageLimitBytes
     FROM users WHERE id = :userId`,
    { userId }
  );
  return Array.isArray(rows) ? rows[0] : undefined;
}

export async function getUserSettings(userId: string) {
  const [rows] = await pool.execute(
    `SELECT theme, gallery_density AS galleryDensity, sort_order AS sortOrder,
            language, default_album_id AS defaultAlbumId, upload_quality AS uploadQuality
     FROM user_settings WHERE user_id = :userId`,
    { userId }
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : { theme: 'system', galleryDensity: 'comfortable', sortOrder: 'newest', language: 'en', defaultAlbumId: null, uploadQuality: 'high' };
}

export async function updateUserSettings(userId: string, settings: Record<string, unknown>) {
  await pool.execute(
    `UPDATE user_settings SET
      theme = COALESCE(:theme, theme),
      gallery_density = COALESCE(:galleryDensity, gallery_density),
      sort_order = COALESCE(:sortOrder, sort_order),
      language = COALESCE(:language, language),
      default_album_id = COALESCE(:defaultAlbumId, default_album_id),
      upload_quality = COALESCE(:uploadQuality, upload_quality)
     WHERE user_id = :userId`,
    {
      userId,
      theme: settings.theme ?? null,
      galleryDensity: settings.galleryDensity ?? null,
      sortOrder: settings.sortOrder ?? null,
      language: settings.language ?? null,
      defaultAlbumId: settings.defaultAlbumId ?? null,
      uploadQuality: settings.uploadQuality ?? null
    }
  );
  return getUserSettings(userId);
}
