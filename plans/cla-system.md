# CLA Signature System

## Context

Solsynth projects need a Contributor License Agreement enforcement system. Contributors must sign the CLA (stored in `content/legal/en/contributor-license.md`) via Capital's web UI before their GitHub PRs can be merged. The system uses Solar Network's Account Connections API to link a user's Capital identity to their GitHub identity.

## Design

### Identity Linking Flow

```
User on /contributor-license page (authenticated via Solar Network)
  → Capital calls Solar Network: GET /api/accounts/me/connections?provider=github
  → If GitHub connected: gets github user_id + username from connection meta
  → If not connected: shows "Connect GitHub on Solar Network first" with link
  → User clicks "Sign CLA"
  → Capital stores signature: { user_id, github_user_id, github_username, cla_version, signed_at }
```

### GitHub Bot Flow

```
PR opened/updated → GitHub webhook → Capital /api/github/webhook
  → Extract PR author github username
  → Query cla_signature table for matching github_username + current cla_version
  → If signed:
      - Set commit status: success "CLA signed"
      - Add label: "cla-signed", remove "cla-not-signed"
      - Comment: ✅ (only on first check, not spam)
  → If not signed:
      - Set commit status: failure "CLA not signed — sign at https://capital.solsynth.dev/contributor-license"
      - Add label: "cla-not-signed", remove "cla-signed"
      - Comment: ❌ with link to sign
```

### CLA Versioning

The `updatedDate` field from the markdown frontmatter (`"2026-06-18"`) is the CLA version. When it changes, all previous signatures become outdated — contributors must re-sign. Bot checks signatures matching the current version only.

---

## Files to Modify

### 1. Database — new `cla_signature` table

**`server/db/schema.ts`** — add table + relations

```ts
export const claSignature = pgTable("cla_signature", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  githubUserId: integer("github_user_id").notNull(),
  githubUsername: text("github_username").notNull(),
  claVersion: text("cla_version").notNull(), // = updatedDate from markdown
  signedAt: timestamp("signed_at").defaultNow().notNull(),
}, (table) => [
  index("cla_signature_user_idx").on(table.userId),
  index("cla_signature_github_idx").on(table.githubUserId),
  index("cla_signature_version_idx").on(table.claVersion),
]);
```

Unique constraint: `(github_user_id, cla_version)` — one signature per GitHub user per CLA version.

### 2. OAuth scope — add `account.connections`

**`server/utils/auth.ts`** — add `account.connections` to Solian scopes

```ts
scopes: ['openid', 'profile', 'email', 'account.connections'],
```

Existing users will need to re-authorize to grant the new scope.

### 3. Server API — 3 endpoints

**`server/api/cla/signature.get.ts`** — check if current user has signed
- Calls Solar Network connections API to get GitHub identity
- Queries `cla_signature` for current user + current CLA version
- Returns `{ signed: boolean, signature?, githubConnected: boolean, githubUsername? }`

**`server/api/cla/sign.post.ts`** — sign the CLA
- Validates user is authenticated
- Fetches GitHub connection from Solar Network
- If no GitHub connection → 400 error
- Reads CLA `updatedDate` from content query
- Inserts into `cla_signature` (idempotent via upsert on unique constraint)
- Returns the signature

**`server/api/github/webhook.post.ts`** — GitHub webhook handler
- Validates `X-Hub-Signature-256` webhook secret
- Handles `pull_request` events (opened, synchronize, reopened)
- Extracts PR author GitHub username
- Queries `cla_signature` for that username + current CLA version
- Uses GitHub API to: set commit status, manage labels, post comment
- Needs `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET` env vars

### 4. Composable

**`app/composables/useCla.ts`**
- `useCla()` → `{ status, loading, error, sign, refresh }`
- `status` reactive ref with `{ signed, signature, githubConnected, githubUsername }`
- `sign()` calls POST `/api/cla/sign`

### 5. UI Page

**`app/pages/contributor-license.vue`** — CLA signing page

Layout:
- If not authenticated: "Sign in to continue" button → `/auth/login`
- If no GitHub connection: "Connect your GitHub account on Solar Network first" with link to Solarpass connections page
- If GitHub connected but not signed: show CLA content (rendered from markdown), "I agree — Sign CLA" button at bottom
- If already signed: show ✅ status card with `signed_at`, `cla_version`, `github_username`

### 6. GitHub Bot Setup (manual steps, documented in plan)

Create a GitHub App on the org with:
- **Permissions:** `checks:write`, `pull_requests:write`, `statuses:write`
- **Events:** `pull_request`
- **Webhook URL:** `https://capital.solsynth.dev/api/github/webhook`

Env vars needed:
- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY` (PEM)
- `GITHUB_WEBHOOK_SECRET`
- `GITHUB_APP_INSTALLATION_ID`

---

## Steps

- [ ] Add `cla_signature` table to `server/db/schema.ts` with relations
- [ ] Run `npx drizzle-kit generate && npx drizzle-kit migrate`
- [ ] Add `account.connections` scope to `server/utils/auth.ts`
- [ ] Create `app/composables/useCla.ts`
- [ ] Create `server/api/cla/signature.get.ts`
- [ ] Create `server/api/cla/sign.post.ts`
- [ ] Create `server/api/github/webhook.post.ts`
- [ ] Create `app/pages/contributor-license.vue`
- [ ] Add i18n keys for CLA page
- [ ] Add `GITHUB_*` env vars to `.env.example`
- [ ] Update README with CLA section

## Reuse

- `server/api/auth/solar-profile.get.ts` — same pattern for fetching from Solar Network API with Bearer token
- `app/composables/useSolarProfile.ts` — same pattern for composable with reactive data/loading/error
- `server/utils/auth.ts` — existing auth setup, just needs scope addition
- `content/legal/en/contributor-license.md` — existing CLA text, read via Nuxt Content query
- `app/pages/legal/[slug].vue` — existing legal page rendering pattern

## Verification

1. Sign in on Capital → visit `/contributor-license` → should show GitHub connection status
2. If GitHub not connected → shows link to connect
3. If connected → shows CLA text + sign button
4. After signing → shows success card
5. Open a PR on a Solsynth repo → bot should check CLA status and set commit status + label + comment
6. Build passes: `npx nuxt build`
