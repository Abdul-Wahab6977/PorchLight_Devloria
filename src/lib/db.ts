import fs from "node:fs";
import path from "node:path";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";

// -----------------------------------------------------------------------------
// Porchlight uses sql.js (SQLite compiled to WASM, pure JS/WASM — no native
// binary compilation, no external engine download) as its embedded database.
// This keeps the project runnable in any sandboxed environment out of the box.
//
// The whole data layer sits behind the functions in `queries.ts`, so swapping
// this file for a Postgres connection (Prisma/Drizzle) in production is a
// contained change — nothing above this layer needs to know the difference.
// -----------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "porchlight.sqlite3");
const SCHEMA_FILE = path.join(process.cwd(), "src", "lib", "schema.sql");

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let dirty = false;

async function loadEngine(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    locateFile: (file: string) =>
      path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
  });
  return SQL;
}

export async function getDb(): Promise<Database> {
  if (db) return db;
  const engine = await loadEngine();

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (fs.existsSync(DB_FILE)) {
    const buffer = fs.readFileSync(DB_FILE);
    db = new engine.Database(buffer);
  } else {
    db = new engine.Database();
  }

  const schema = fs.readFileSync(SCHEMA_FILE, "utf-8");
  db.run(schema);
  db.run("PRAGMA foreign_keys = ON;");
  persist(); // ensure the file exists on first boot

  return db;
}

/** Write the in-memory database back to disk. Call after any mutation. */
export function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
  dirty = false;
}

export function markDirty() {
  dirty = true;
}

export function isDirty() {
  return dirty;
}

/** Run a mutation (INSERT/UPDATE/DELETE) with bound params, then persist. */
export async function run(sql: string, params: Record<string, unknown> = {}) {
  const database = await getDb();
  database.run(sql, params as any);
  persist();
}

/** Run a SELECT and return rows as plain objects. */
export async function all<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const database = await getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params as any);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

/** Run a SELECT and return the first row, or null. */
export async function get<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  const rows = await all<T>(sql, params);
  return rows[0] ?? null;
}
