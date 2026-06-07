import { createRequire } from 'module'
import { isPostgres } from '../db'
import * as schema from '../db'

const _require = createRequire(import.meta.url)
const dbUrl = process.env.DATABASE_URL || ''

function createDb() {
  if (isPostgres) {
    const { drizzle } = _require('drizzle-orm/node-postgres')
    const { Pool } = _require('pg')
    const pool = new Pool({ connectionString: dbUrl })
    return drizzle(pool, { schema })
  }
  else {
    const { drizzle } = _require('drizzle-orm/better-sqlite3')
    const Database = _require('better-sqlite3')
    const sqlite = new Database('server/local.db')
    return drizzle(sqlite, { schema })
  }
}

export const db = createDb()
