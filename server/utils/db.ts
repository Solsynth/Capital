import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { isPostgres } from "../db";
import * as schema from "../db";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
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
  return drizzleSqlite(sqlite, { schema });
}

export const db = createDb();
