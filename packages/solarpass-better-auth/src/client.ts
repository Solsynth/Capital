import type { BetterAuthClientPlugin } from "better-auth/client";
import type { solarpassPlugin } from "./plugin.js";
import type { SolarProfile } from "./types.js";

/**
 * Solar Pass profile response with avatar URL.
 */
export interface SolarpassAvatarResult {
  avatarUrl: string | null;
  name: string;
}

/**
 * Client plugin for Solar Pass.
 *
 * Provides type-safe methods for accessing Solar Network profile endpoints.
 *
 * @example
 * ```ts
 * import { createAuthClient } from "better-auth/client";
 * import { solarpassClient } from "@solar-network/better-auth/client";
 *
 * const authClient = createAuthClient({
 *   plugins: [solarpassClient()],
 * });
 *
 * // Fetch profile
 * const { data, error } = await authClient.getSolarProfile();
 *
 * // Refresh profile
 * const { data } = await authClient.refreshSolarProfile();
 *
 * // Get avatar
 * const { data } = await authClient.getSolarAvatar();
 * ```
 */
export const solarpassClient = () => ({
  id: "solarpass",
  $InferServerPlugin: {} as ReturnType<typeof solarpassPlugin>,
  pathMethods: {
    "/solarpass/profile": "GET",
    "/solarpass/refresh": "POST",
    "/solarpass/avatar": "GET",
  },
});
