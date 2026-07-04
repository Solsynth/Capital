# @solar-network/better-auth

Better Auth plugin for [Solarpass](https://solian.app) (Solar Network) OIDC authentication with built-in profile caching.

## Installation

```bash
npm install @solar-network/better-auth
```

## Quick Start

### 1. Server Setup

```typescript
// auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { solarpass, solarpassPlugin } from "@solar-network/better-auth";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  plugins: [
    genericOAuth({
      config: [
        solarpass({
          clientId: process.env.SOLIAN_CLIENT_ID!,
          clientSecret: process.env.SOLIAN_CLIENT_SECRET!,
        }),
      ],
    }),
    solarpassPlugin(),
  ],
});
```

### 2. Client Setup

```typescript
// auth-client.ts
import { createAuthClient } from "better-auth/client";
import { solarpassClient } from "@solar-network/better-auth/client";

export const authClient = createAuthClient({
  plugins: [solarpassClient()],
});
```

### 3. Generate Database Schema

```bash
npx @better-auth/cli@latest generate
```

This adds `solar_profile` (json) and `solar_profile_updated_at` (timestamp) columns to your `account` table.

### 4. Nitro Handler (Nuxt)

```typescript
// server/api/auth/[...all].ts
import { auth } from "~~/server/utils/auth";
import { toWebRequest } from "h3";

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event));
});
```

## Profile Caching

User profiles from the Solar Network API are automatically cached in the database:

- **TTL**: 24 hours (configurable)
- **Auto-refresh**: Profile is refreshed on OAuth sign-in if cache is stale
- **Manual refresh**: Call `POST /solarpass/refresh` or use `authClient.refreshSolarProfile()`
- **Endpoints**:
  - `GET /solarpass/profile` — Cached or fresh profile
  - `POST /solarpass/refresh` — Force refresh from API
  - `GET /solarpass/avatar` — Direct avatar URL

## Client Usage

```typescript
// Fetch profile (cached or fresh)
const { data: profile } = await authClient.getSolarProfile();

// Force refresh
const { data } = await authClient.refreshSolarProfile();

// Get avatar URL
const { data: avatar } = await authClient.getSolarAvatar();
// avatar = { avatarUrl: "https://...", name: "littlesheep" }
```

## API Reference

### `solarpass(options)`

Provider helper for `genericOAuth` plugin. Pre-configured with Solarpass OIDC discovery.

```typescript
solarpass({
  clientId: string;        // Required
  clientSecret: string;    // Required
  scopes?: string[];       // Default: ["openid", "profile", "email", "account.connections"]
  redirectURI?: string;    // Default: ${baseURL}/api/auth/oauth2/callback/solarpass
  disableSignUp?: boolean;
  overrideUserInfo?: boolean;
})
```

### `solarpassPlugin(options?)`

Server plugin for profile caching and endpoints.

```typescript
solarpassPlugin({
  cacheTTL?: number;       // Default: 86400000 (24h)
  apiBaseUrl?: string;     // Default: "https://api.solian.app"
  mapProfileToUser?: (profile) => Record<string, any>;  // Map profile fields to user table
})
```

### `solarpassClient()`

Client plugin providing typed methods for profile endpoints.

## Environment Variables

```env
SOLIAN_CLIENT_ID=your-client-id
SOLIAN_CLIENT_SECRET=your-client-secret
BETTER_AUTH_SECRET=your-random-secret
BETTER_AUTH_URL=http://localhost:3000
```

## How It Works

### OAuth Flow

1. User clicks "Sign in with Solarpass"
2. `signIn.social({ provider: "solarpass" })` redirects to Solarpass
3. Solarpass redirects back to `/api/auth/oauth2/callback/solarpass`
4. better-auth handles token exchange, creates user/account/session
5. Plugin hook auto-fetches and caches the Solar profile

### Profile Fetch Flow

```
Client → GET /solarpass/profile
  → Plugin checks account.solar_profile + solar_profile_updated_at
  → If fresh (< 24h): return cached JSON
  → If stale: use account.access_token to call Solar Network API
  → Update cache → return fresh data
```

### Account Table Schema

The plugin extends the standard better-auth `account` table:

| Column | Type | Description |
|--------|------|-------------|
| `solar_profile` | json | Cached Solar Network profile response |
| `solar_profile_updated_at` | timestamp | Last refresh time |

## Notes

- Solarpass uses OIDC Discovery at `https://solian.app/.well-known/openid-configuration`
- The `account.connections` scope is required for fetching connected accounts
- Profile `name` field is the Solar Network account handle (e.g., `littlesheep`)
- Profile `nick` field is the display name (e.g., `小羊`)
- Avatar URLs use the account handle: `https://api.solian.app/passport/accounts/{name}/picture`

## License

MIT
