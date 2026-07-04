import { createAuthEndpoint, createAuthMiddleware, sessionMiddleware } from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";
import type { SolarpassPluginOptions, SolarProfile } from "./types.js";
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_CACHE_TTL,
  fetchSolarProfile,
  getSolarAvatarUrl,
  isProfileFresh,
} from "./profile.js";

/**
 * Solar Pass server plugin for better-auth.
 *
 * Extends the account table with profile caching columns and provides
 * endpoints for fetching, refreshing, and accessing Solar Network profiles.
 *
 * @example
 * ```ts
 * import { betterAuth } from "better-auth";
 * import { drizzleAdapter } from "better-auth/adapters/drizzle";
 * import { genericOAuth } from "better-auth/plugins";
 * import { solarpass, solarpassPlugin } from "@solar-network/better-auth";
 *
 * export const auth = betterAuth({
 *   database: drizzleAdapter(db, { provider: "pg" }),
 *   plugins: [
 *     genericOAuth({
 *       config: [solarpass({ clientId: "...", clientSecret: "..." })],
 *     }),
 *     solarpassPlugin(),
 *   ],
 * });
 * ```
 */
export const solarpassPlugin = (options: SolarpassPluginOptions = {}) => {
  const cacheTTL = options.cacheTTL ?? DEFAULT_CACHE_TTL;
  const apiBaseUrl = options.apiBaseUrl ?? DEFAULT_API_BASE_URL;

  return {
    id: "solarpass",

    /**
     * Extend the account table with profile cache columns.
     */
    schema: {
      account: {
        fields: {
          solarProfile: {
            type: "string",
            required: false,
            input: false,
          },
          solarProfileUpdatedAt: {
            type: "date",
            required: false,
            input: false,
          },
        },
      },
    } as const,

    /**
     * Profile endpoints.
     */
    endpoints: {
      /**
       * GET /solar-pass/profile
       * Returns the cached solar profile for the current user.
       * Fetches from API if cache is missing or stale.
       */
      getSolarProfile: createAuthEndpoint(
        "/solar-pass/profile",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session) return ctx.json(null);

          const account = await ctx.context.adapter.findOne<{
            id: string;
            accessToken: string | null;
            solarProfile: string | null;
            solarProfileUpdatedAt: Date | null;
          }>({
            model: "account",
            where: [
              { field: "userId", value: session.user.id },
              { field: "providerId", value: "solarpass" },
            ],
          });

          if (!account) return ctx.json(null);

          let profile: SolarProfile | null = null;

          if (account.solarProfile) {
            try {
              profile = JSON.parse(account.solarProfile);
            } catch {
              profile = null;
            }
          }

          const fresh = isProfileFresh(account.solarProfileUpdatedAt, cacheTTL);
          if (profile && fresh) {
            return ctx.json(profile);
          }

          if (account.accessToken) {
            const freshProfile = await fetchSolarProfile(account.accessToken, apiBaseUrl);
            if (freshProfile) {
              await ctx.context.adapter.update({
                model: "account",
                where: [{ field: "id", value: account.id }],
                update: {
                  solarProfile: JSON.stringify(freshProfile),
                  solarProfileUpdatedAt: new Date(),
                },
              });
              return ctx.json(freshProfile);
            }
          }

          return ctx.json(profile);
        },
      ),

      /**
       * POST /solar-pass/refresh
       * Force-refresh the solar profile from the API.
       */
      refreshSolarProfile: createAuthEndpoint(
        "/solar-pass/refresh",
        {
          method: "POST",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session) return ctx.json(null);

          const account = await ctx.context.adapter.findOne<{
            id: string;
            accessToken: string | null;
          }>({
            model: "account",
            where: [
              { field: "userId", value: session.user.id },
              { field: "providerId", value: "solarpass" },
            ],
          });

          if (!account?.accessToken) return ctx.json(null);

          const freshProfile = await fetchSolarProfile(account.accessToken, apiBaseUrl);
          if (!freshProfile) return ctx.json(null);

          await ctx.context.adapter.update({
            model: "account",
            where: [{ field: "id", value: account.id }],
            update: {
              solarProfile: JSON.stringify(freshProfile),
              solarProfileUpdatedAt: new Date(),
            },
          });

          return ctx.json(freshProfile);
        },
      ),

      /**
       * GET /solar-pass/avatar
       * Returns the avatar URL for the current user.
       */
      getSolarAvatar: createAuthEndpoint(
        "/solar-pass/avatar",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;
          if (!session) return ctx.json(null);

          const account = await ctx.context.adapter.findOne<{
            solarProfile: string | null;
          }>({
            model: "account",
            where: [
              { field: "userId", value: session.user.id },
              { field: "providerId", value: "solarpass" },
            ],
          });

          if (!account?.solarProfile) {
            return ctx.json({ avatarUrl: null, name: session.user.name });
          }

          try {
            const profile: SolarProfile = JSON.parse(account.solarProfile);
            return ctx.json({
              avatarUrl: getSolarAvatarUrl(profile, apiBaseUrl),
              name: profile.name,
            });
          } catch {
            return ctx.json({ avatarUrl: null, name: session.user.name });
          }
        },
      ),
    },

    /**
     * Hook to auto-update profile after OAuth sign-in.
     */
    hooks: {
      after: [
        {
          matcher: (context) =>
            context.path === "/oauth2/callback/solarpass" ||
            context.path === "/sign-in/oauth2",
          handler: createAuthMiddleware(async (ctx) => {
            const session = ctx.context.session;
            if (!session) return;

            try {
              const account = await ctx.context.adapter.findOne<{
                id: string;
                accessToken: string | null;
                solarProfileUpdatedAt: Date | null;
              }>({
                model: "account",
                where: [
                  { field: "userId", value: session.user.id },
                  { field: "providerId", value: "solarpass" },
                ],
              });

              if (!account?.accessToken) return;

              const fresh = isProfileFresh(account.solarProfileUpdatedAt, cacheTTL);
              if (fresh) return;

              const profile = await fetchSolarProfile(account.accessToken, apiBaseUrl);
              if (!profile) return;

              await ctx.context.adapter.update({
                model: "account",
                where: [{ field: "id", value: account.id }],
                update: {
                  solarProfile: JSON.stringify(profile),
                  solarProfileUpdatedAt: new Date(),
                },
              });

              if (options.mapProfileToUser) {
                const mapped = await options.mapProfileToUser(profile);
                if (mapped && Object.keys(mapped).length > 0) {
                  await ctx.context.adapter.update({
                    model: "user",
                    where: [{ field: "id", value: session.user.id }],
                    update: mapped,
                  });
                }
              }
            } catch {
              // Silently fail — profile caching is best-effort
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
};
