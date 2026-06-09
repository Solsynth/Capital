import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { isPostgres } from "../db";
import * as schema from "../db";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { migrate as migrateSqlite } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const dbUrl = process.env.DATABASE_URL || "";

function resolveSqlitePath() {
  if (dbUrl.startsWith("file:")) {
    return dbUrl.slice("file:".length);
  }

  const nitroDataDir = process.env.NITRO_DATA_DIR || "server";
  return join(nitroDataDir, "local.db");
}

function ensureSqliteDirectory(sqlitePath: string) {
  const lastSlash = sqlitePath.lastIndexOf("/");
  const dir = lastSlash >= 0 ? sqlitePath.slice(0, lastSlash) : ".";
  mkdirSync(dir, { recursive: true });
}

function createDb() {
  if (isPostgres) {
    const pool = new Pool({ connectionString: dbUrl });
    return drizzlePg(pool, { schema });
  }

  const sqlitePath = resolveSqlitePath();
  ensureSqliteDirectory(sqlitePath);
  const sqlite = new Database(sqlitePath);
  sqlite.pragma("journal_mode = WAL");
  const instance = drizzleSqlite(sqlite, { schema });
  if (import.meta.dev) {
    migrateSqlite(instance, { migrationsFolder: "drizzle" });
  }
  return instance;
}

export const db = createDb();
