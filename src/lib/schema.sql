-- Porchlight Realty schema
-- Portable standard SQL, works on SQLite here and translates directly to
-- Postgres/MySQL when the project is deployed with Prisma/Drizzle in production.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('BUYER','AGENT','ADMIN')) DEFAULT 'BUYER',
  phone         TEXT,
  avatar_seed   TEXT,
  bio           TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS properties (
  id             TEXT PRIMARY KEY,
  agent_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  price          INTEGER NOT NULL,
  property_type  TEXT NOT NULL CHECK (property_type IN ('SINGLE_FAMILY','APARTMENT','CONDO','TOWNHOUSE','LAND')),
  status         TEXT NOT NULL CHECK (status IN ('FOR_SALE','PENDING','SOLD')) DEFAULT 'FOR_SALE',
  bedrooms       INTEGER NOT NULL DEFAULT 0,
  bathrooms      REAL NOT NULL DEFAULT 0,
  sqft           INTEGER NOT NULL DEFAULT 0,
  lot_size       INTEGER,
  year_built     INTEGER,
  address        TEXT NOT NULL,
  city           TEXT NOT NULL,
  state          TEXT NOT NULL,
  zip            TEXT NOT NULL,
  lat            REAL,
  lng            REAL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS property_images (
  id          TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS favorites (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, property_id)
);

CREATE TABLE IF NOT EXISTS saved_searches (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  criteria_json TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiries (
  id          TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('NEW','READ','RESPONDED')) DEFAULT 'NEW',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_agent ON inquiries(agent_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
