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

function createDb() {
  if (isPostgres) {
    const pool = new Pool({ connectionString: dbUrl });
    return drizzlePg(pool, { schema });
  }

  const sqlite = new Database(resolveSqlitePath());
  return drizzleSqlite(sqlite, { schema });
}

export const db = createDb();
