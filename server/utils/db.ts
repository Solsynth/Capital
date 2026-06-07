import { isPostgres } from "../db";
import * as schema from "../db";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { Pool } from "pg";
import { createClient } from "@libsql/client";

const dbUrl = process.env.DATABASE_URL || "";

function createDb() {
  if (isPostgres) {
    const pool = new Pool({ connectionString: dbUrl });
    return drizzlePg(pool, { schema });
  } else {
    const sqlite = createClient({ url: dbUrl || "file:server/local.db" });
    return drizzleLibsql(sqlite, { schema });
  }
}

export const db = createDb();
