/**
 * SQLite database for VIDDA WEAR admin (M5).
 * File-based, zero-ops. Persists on the host filesystem.
 *
 * Path resolution: VIDDA_DATA_DIR (env) ?? <cwd>/data, file = vidda.db.
 *
 * On every cold start we run idempotent migrations that create tables if
 * missing. Migrations are pure SQL; no migration framework needed yet.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.VIDDA_DATA_DIR ?? path.join(process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "vidda.db");

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  const handle = new Database(DB_PATH);
  handle.pragma("journal_mode = WAL");
  handle.pragma("foreign_keys = ON");
  migrate(handle);
  _db = handle;
  return handle;
}

function migrate(d: Database.Database): void {
  d.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id            TEXT PRIMARY KEY,
      slug          TEXT UNIQUE NOT NULL,
      title         TEXT NOT NULL,
      title_ar      TEXT,
      price         INTEGER NOT NULL,
      price_before  INTEGER,
      description   TEXT,
      images_json   TEXT NOT NULL DEFAULT '[]',
      options_json  TEXT NOT NULL DEFAULT '[]',
      in_stock      INTEGER NOT NULL DEFAULT 1,
      sku           TEXT,
      collection_id TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS collections (
      id            TEXT PRIMARY KEY,
      slug          TEXT UNIQUE NOT NULL,
      title         TEXT NOT NULL,
      description   TEXT,
      hero_image    TEXT,
      sort          INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id            TEXT PRIMARY KEY,
      customer_json TEXT NOT NULL,
      lines_json    TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      total         INTEGER NOT NULL,
      currency      TEXT NOT NULL DEFAULT 'EGP',
      status        TEXT NOT NULL DEFAULT 'pending',
      source        TEXT,
      locale        TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

    CREATE TABLE IF NOT EXISTS customers (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      phone         TEXT,
      email         TEXT,
      first_seen    TEXT NOT NULL DEFAULT (datetime('now')),
      last_seen     TEXT NOT NULL DEFAULT (datetime('now')),
      orders_count  INTEGER NOT NULL DEFAULT 0,
      lifetime_value INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

    CREATE TABLE IF NOT EXISTS homepage_sections (
      id            TEXT PRIMARY KEY,
      kind          TEXT NOT NULL,
      title         TEXT,
      body          TEXT,
      cta_label     TEXT,
      cta_href      TEXT,
      image         TEXT,
      sort          INTEGER NOT NULL DEFAULT 0,
      enabled       INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS images (
      id            TEXT PRIMARY KEY,
      path          TEXT UNIQUE NOT NULL,
      alt           TEXT,
      width         INTEGER,
      height        INTEGER,
      bytes         INTEGER,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
