import { createClient, type Client } from "@libsql/client";

// Singleton client instance for serverless environments
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

/** Legacy support functions to prevent breaking queries.ts */
export async function getDb() {
  return getDbClient();
}

export function persist() {
  // Turso automatically persists data in cloud, no local file saving needed
}

export function markDirty() {}
export function isDirty() {
  return false;
}

/** Run a mutation (INSERT/UPDATE/DELETE) with bound params */
export async function run(sql: string, params: Record<string, unknown> = {}) {
  const db = getDbClient();
  await db.execute({ sql, args: params as any });
}

/** Run a SELECT and return rows as plain objects */
export async function all<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const db = getDbClient();
  const result = await db.execute({ sql, args: params as any });
  
  // Map result rows to plain objects
  return result.rows.map((row) => {
    const obj: Record<string, unknown> = {};
    result.columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj as T;
  });
}

/** Run a SELECT and return the first row, or null */
export async function get<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  const rows = await all<T>(sql, params);
  return rows[0] ?? null;
}