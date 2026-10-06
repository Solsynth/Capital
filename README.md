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

No setup needed. In local development, the database file is created from `DATABASE_URL`. If `DATABASE_URL` is unset, the app falls back to `server/local.db`.

```env
DATABASE_URL=file:./local.db
```

In the Docker image, use a writable persistent path instead, for example:

```env
DATABASE_URL=file:/data/nitro/local.db
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

## Solar Network widgets (SunkenLand)

Posts on `/updates/[id]` embed SunkenLand's `sk-*` custom elements: reaction chips
(`sk-reaction-list`) and the reply thread (`sk-reply-composer` + `sk-replies-list`).

- `app/plugins/sunkenland.client.ts` configures the elements once (API origin, preset
  stylesheets, `public/stickers` for reaction stickers) and hands them the signed-in
  user's Solar token from `server/api/sn/token.get.ts`, so no second Solarpass sign-in
  is needed on top of better-auth. Signed-out visitors get the widgets' guest states.
- `app/components/UpdateReactions.vue` / `UpdateReplies.vue` wrap them for the update
  pages; `nuxt.config.ts` marks `sk-*` as custom elements and `app/assets/css/global.css`
  maps DaisyUI tokens onto the widgets' `--sk-*` surface.
- The dependency is vendored (`vendor/solsynth-sunkenland-0.1.2.tgz`) from the sibling
  `SolarNetwork/SunkenLand` checkout: 0.1.2 tolerates the `null` tag names the live API
  sends, which the published 0.1.1 rejects and would break every reply list. Once 0.1.2
  is on npm, switch back with
  `bun add @solsynth/sunkenland@^0.1.2 && rm -rf vendor/`.

## Project Structure

```
├── app/
│   ├── components/     # Vue components (AppNavbar, etc.)
│   ├── composables/    # useApi, useAuth
│   ├── layouts/        # App layout
│   ├── middleware/      # Route guards (auth)
│   ├── pages/          # File-based routing
│   └── lib/            # Auth client (auth-client.ts)
├── content/            # Nuxt Content (blog, docs)
├── drizzle/            # SQLite migrations
├── drizzle-pg/         # PostgreSQL migrations
├── i18n/
│   └── locales/        # en.json, zh.json (nuxt i18n v10 layout)
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
