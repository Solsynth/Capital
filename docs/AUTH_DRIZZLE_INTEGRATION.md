# Integrating Better Auth + Drizzle ORM into Nuxt 4

A step-by-step guide to adding authentication and database to a Nuxt 4 app using Better Auth (email/password + OIDC) and Drizzle ORM (SQLite or PostgreSQL).

## 1. Install Dependencies

```bash
# Auth + ORM
npm install better-auth drizzle-orm pg

# Dev tooling
npm install -D drizzle-kit @types/pg oxc-parser

# SQLite (zero-config, for local dev) — already a dependency if using @nuxt/content
npm install better-sqlite3
```

## 2. Environment Variables

Add to `.env`:

```env
# Database — SQLite (local) or PostgreSQL (production)
DATABASE_URL=file:./local.db
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# Better Auth
BETTER_AUTH_SECRET=<openssl rand -hex 32>
BETTER_AUTH_URL=http://localhost:3000

# OIDC Provider (optional)
SOLIAN_CLIENT_ID=
SOLIAN_CLIENT_SECRET=

# First admin seed (optional)
SEED_ADMIN_SECRET=<openssl rand -hex 16>
```

## 3. Database Schema

### Create schema files

Create **two** schema files — one per dialect. The Better Auth CLI generates the SQLite variant; copy and adapt for Postgres.

```bash
mkdir -p server/db
```

**`server/db/schema-sqlite.ts`** — generate with:

```bash
# Create a minimal auth config first (see step 4), then:
npx @better-auth/cli generate --config server/utils/auth.ts --output server/db/schema-sqlite.ts
```

**`server/db/schema-pg.ts`** — copy the SQLite schema and convert:
- `sqliteTable` → `pgTable`
- `integer("...", { mode: "timestamp_ms" })` → `timestamp("...")`
- `integer("...", { mode: "boolean" })` → `boolean("...")`
- `sql\`(cast(unixepoch('subsecond') * 1000 as integer))\`` → `defaultNow()`

### Schema index (auto-detect)

**`server/db/index.ts`**:

```ts
const dbUrl = process.env.DATABASE_URL || ''
export const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')

import * as sqliteSchema from './schema-sqlite'
import * as pgSchema from './schema-pg'

const schema = isPostgres ? pgSchema : sqliteSchema

export const user = schema.user
export const session = schema.session
export const account = schema.account
export const verification = schema.verification
export const userRelations = schema.userRelations
export const sessionRelations = schema.sessionRelations
export const accountRelations = schema.accountRelations
```

## 4. Drizzle Config

**`drizzle.config.ts`**:

```ts
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
```

## 5. Database Instance

**`server/utils/db.ts`**:

```ts
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
```

> **Why `createRequire`?** Nuxt 4 uses ES modules (`"type": "module"`), so `require()` isn't available. `createRequire(import.meta.url)` brings it back for conditional dynamic imports.

## 6. Better Auth Server Config

**`server/utils/auth.ts`**:

```ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { genericOAuth } from 'better-auth/plugins'
import { db } from './db'
import { isPostgres } from '../db'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: isPostgres ? 'pg' : 'sqlite' }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    // Generic OAuth for custom OIDC providers
    genericOAuth({
      config: [
        {
          providerId: 'solian',
          clientId: process.env.SOLIAN_CLIENT_ID as string,
          clientSecret: process.env.SOLIAN_CLIENT_SECRET as string,
          discoveryUrl: 'https://solian.app/.well-known/openid-configuration',
          scopes: ['openid', 'profile', 'email'],
        },
      ],
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
})
```

### Built-in vs Generic OAuth

Better Auth has **built-in** social providers (Google, GitHub, Apple, etc.) configured via `socialProviders`:

```ts
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
},
```

For **custom OIDC providers** (like self-hosted IdPs), use the `genericOAuth` plugin with `discoveryUrl` pointing to the `.well-known/openid-configuration` endpoint. The plugin auto-discovers authorization, token, and userinfo endpoints.

## 7. Catch-All Auth Route

**`server/api/auth/[...all].ts`**:

```ts
import { auth } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event))
})
```

> **Important:** Use `~~/` (project root) for server-side imports, not `~/` (which resolves to `app/` in Nuxt 4).

## 8. Auth Client

**`app/lib/auth-client.ts`**:

```ts
import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient()

export const { signIn, signOut, signUp, useSession } = authClient
```

> **Important:** Don't pass `baseURL` — it defaults to `/api/auth` (relative), which works correctly for both SSR and client-side. If you pass `http://localhost:3000`, Better Auth strips the path and calls `/get-session` instead of `/api/auth/get-session`.

## 9. SSR-Aware Composable

**`app/composables/useAuth.ts`**:

```ts
import { createAuthClient } from 'better-auth/vue'

export function useAuth() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  return createAuthClient({
    baseURL: url.origin,
    fetchOptions: { headers },
  })
}
```

Use this for SSR-safe auth calls that need to forward cookies (e.g., `listAccounts`).

## 10. Auth Middleware

**`app/middleware/auth.ts`**:

```ts
import { authClient } from '~/lib/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)
  if (!session.value) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  }
})
```

Apply to pages:

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
```

## 11. Session in Components

```vue
<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

const { data: session } = await authClient.useSession(useFetch)
</script>

<template>
  <div v-if="session?.user">
    {{ session.user.name }}
  </div>
</template>
```

> **Must `await`** — `useSession(useFetch)` chains `.then()` on `useFetch()`, returning a Promise. Nuxt handles top-level `await` in components via Suspense.

## 12. Sign In / Sign Up

### Email + Password

```ts
// Sign up
await authClient.signUp.email({ email, password, name })

// Sign in
await authClient.signIn.email({ email, password, callbackURL: '/' })
```

### OIDC (Generic OAuth)

```ts
await authClient.signIn.social({ provider: 'solian', callbackURL: '/' })
```

### Built-in Social Provider

```ts
await authClient.signIn.social({ provider: 'github', callbackURL: '/' })
```

## 13. Generate & Run Migrations

```bash
# Generate migration SQL
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

## 14. `.gitignore`

```gitignore
# Local SQLite database
server/local.db
```

## Quick Reference: Nuxt 4 Path Aliases

| Alias | Resolves to | Use in |
|-------|-------------|--------|
| `~` | `app/` | Client components, composables |
| `~~` | project root | Server utils, DB imports |

## File Structure

```
├── app/
│   ├── lib/
│   │   └── auth-client.ts          # Better Auth Vue client
│   ├── composables/
│   │   └── useAuth.ts              # SSR-aware auth composable
│   ├── middleware/
│   │   └── auth.ts                 # Route guard
│   └── pages/
│       └── auth/
│           ├── login.vue           # Login page
│           └── profile.vue         # Profile page
├── server/
│   ├── api/
│   │   └── auth/
│   │       └── [...all].ts         # Catch-all auth handler
│   ├── db/
│   │   ├── index.ts                # Auto-detect dialect
│   │   ├── schema-sqlite.ts        # SQLite schema
│   │   └── schema-pg.ts            # PostgreSQL schema
│   └── utils/
│       ├── auth.ts                 # Better Auth config
│       └── db.ts                   # Drizzle DB instance
├── drizzle/                        # SQLite migrations
├── drizzle-pg/                     # PostgreSQL migrations
├── drizzle.config.ts               # Drizzle Kit config
└── .env
```
