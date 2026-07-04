import type { SolarpassProviderOptions } from "./types.js";

/**
 * Solarpass (Solar Network) provider helper for better-auth's genericOAuth plugin.
 *
 * @example
 * ```ts
 * import { betterAuth } from "better-auth";
 * import { genericOAuth } from "better-auth/plugins";
 * import { solarpass } from "@solar-network/better-auth";
 *
 * export const auth = betterAuth({
 *   plugins: [
 *     genericOAuth({
 *       config: [
 *         solarpass({
 *           clientId: process.env.SOLIAN_CLIENT_ID!,
 *           clientSecret: process.env.SOLIAN_CLIENT_SECRET!,
 *         }),
 *       ],
 *     }),
 *   ],
 * });
 * ```
 */
export function solarpass(options: SolarpassProviderOptions) {
  return {
    providerId: "solarpass",
    discoveryUrl: "https://solian.app/.well-known/openid-configuration",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    scopes: options.scopes ?? ["openid", "profile", "email", "account.connections"],
    redirectURI: options.redirectURI,
    disableSignUp: options.disableSignUp,
    disableImplicitSignUp: options.disableImplicitSignUp,
    overrideUserInfo: options.overrideUserInfo,
  };
}
