import { defineConfig } from 'drizzle-kit'

const dbUrl = process.env.DATABASE_URL || ''
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')

export default defineConfig({
  out: isPostgres ? './drizzle-pg' : './drizzle',
  schema: isPostgres ? './server/db/schema-pg.ts' : './server/db/schema-sqlite.ts',
  dialect: isPostgres ? 'postgresql' : 'sqlite',
  dbCredentials: isPostgres
    ? { url: dbUrl }
    : { url: 'server/local.db' },
})
