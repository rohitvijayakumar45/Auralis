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
      avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(input.email)}/240/240`
    }
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
