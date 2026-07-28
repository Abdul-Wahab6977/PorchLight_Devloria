import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function getDbClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error("TURSO_DATABASE_URL environment variable is missing!");
    }

    client = createClient({
      url,
      authToken,
    });
  }
  return client;
}

export async function getDb() {
  return getDbClient();
}

export function persist() {}
export function markDirty() {}
export function isDirty() { return false; }

export async function run(sql: string, params: Record<string, unknown> = {}) {
  const db = getDbClient();
  await db.execute({ sql, args: params as any });
}

export async function all<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  try {
    const db = getDbClient();
    const result = await db.execute({ sql, args: params as any });
    
    return result.rows.map((row) => {
      const obj: Record<string, unknown> = {};
      result.columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj as T;
    });
  } catch (err) {
    console.error("Database query failed:", err);
    return [];
  }
}

export async function get<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  const rows = await all<T>(sql, params);
  return rows[0] ?? null;
}