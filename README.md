# Capital

Solsynth official website — built with Nuxt 4, Tailwind CSS, DaisyUI, Better Auth, and Drizzle ORM.

## Prerequisites

- **Node.js** ≥ 22.12.0
- **npm** (or your preferred package manager)
- **SQLite** (default, zero-config) or **PostgreSQL** (for production)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Run database migrations
npx drizzle-kit generate
npx drizzle-kit migrate

# 4. Start dev server
npm run dev
```

The site runs at `http://localhost:3000` by default.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Database connection string (see below) |
| `BETTER_AUTH_SECRET` | ✅ | Random secret for session signing (generate with `openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | ✅ | Public URL of the app (e.g. `http://localhost:3000`) |
| `SOLIAN_CLIENT_ID` | For OIDC | OAuth client ID from Solarpass |
| `SOLIAN_CLIENT_SECRET` | For OIDC | OAuth client secret from Solarpass |
| `SEED_ADMIN_SECRET` | For first setup | Secret to create the first admin user |
| `PUBLIC_PB_URL` | Legacy | PocketBase instance URL (will be removed later) |
| `NUXT_OG_IMAGE_SECRET` | Optional | Secret for OG image signing |

## Database

The app auto-detects the database type from `DATABASE_URL`.

### SQLite (default — local dev)

No setup needed. The database file is created at `server/local.db`.

```env
DATABASE_URL=file:./local.db
```

### PostgreSQL (production)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

Migrations are stored in a separate directory per dialect:

| Dialect | Migrations dir | Schema file |
|---------|---------------|-------------|
| SQLite  | `./drizzle/`  | `server/db/schema-sqlite.ts` |
| PostgreSQL | `./drizzle-pg/` | `server/db/schema-pg.ts` |

After changing `DATABASE_URL`, regenerate and apply migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Authentication

Better Auth provides email/password and OIDC (Solarpass) authentication.

### Create the first admin

When no users exist, visit:

```
/auth/login?setup=<SEED_ADMIN_SECRET>
```

This reveals a form to create the first (and only) superadmin user. Set `SEED_ADMIN_SECRET` in your `.env` first.

### OIDC (Solarpass)

Set `SOLIAN_CLIENT_ID` and `SOLIAN_CLIENT_SECRET` in `.env`. The OIDC discovery URL is `https://solian.app/.well-known/openid-configuration`.

### Protecting pages

Add the auth middleware to any page:

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
```

Unauthenticated users are redirected to `/auth/login`.

## Project Structure

```
├── app/
│   ├── components/     # Vue components (AppNavbar, etc.)
│   ├── composables/    # useApi, useAuth
│   ├── i18n/           # en.json, zh.json
│   ├── layouts/        # App layout
│   ├── middleware/      # Route guards (auth)
│   ├── pages/          # File-based routing
│   └── lib/            # Auth client (auth-client.ts)
├── content/            # Nuxt Content (blog, docs)
├── drizzle/            # SQLite migrations
├── drizzle-pg/         # PostgreSQL migrations
├── server/
│   ├── api/            # API routes
│   │   ├── auth/       # Better Auth catch-all handler
│   │   └── setup/      # Admin seed endpoints
│   ├── db/             # Drizzle schemas (sqlite + pg) + index
│   └── utils/          # auth.ts, db.ts, pocketbase.ts
├── drizzle.config.ts   # Drizzle Kit config (auto-detects dialect)
├── nuxt.config.ts      # Nuxt config
└── .env                # Environment variables
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run generate` | Static site generation |

## Deployment

1. Set environment variables on your hosting platform
2. Run migrations: `npx drizzle-kit migrate`
3. Build: `npm run build`
4. Start: `node .output/server/index.mjs`

For static hosting (no SSR): `npm run generate` and serve the `.output/public/` directory.
