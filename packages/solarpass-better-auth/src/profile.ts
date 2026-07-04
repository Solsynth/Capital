import type { SolarProfile, SolarpassPluginOptions } from "./types.js";

/**
 * Default API base URL for Solar Network.
 */
export const DEFAULT_API_BASE_URL = "https://api.solian.app";

/**
 * Default cache TTL: 24 hours.
 */
export const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Fetch solar profile from the Solar Network API.
 */
export async function fetchSolarProfile(
  accessToken: string,
  apiBaseUrl: string = DEFAULT_API_BASE_URL,
): Promise<SolarProfile | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/passport/accounts/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Get the avatar URL for a Solar Network profile.
 */
export function getSolarAvatarUrl(
  profile: SolarProfile,
  apiBaseUrl: string = DEFAULT_API_BASE_URL,
): string | null {
  if (!profile.name) return null;
  return `${apiBaseUrl}/passport/accounts/${encodeURIComponent(profile.name)}/picture`;
}

/**
 * Get the background URL from a Solar Network profile.
 */
export function getSolarBackgroundUrl(
  profile: SolarProfile,
  apiBaseUrl: string = DEFAULT_API_BASE_URL,
): string | null {
  const bg = profile.profile?.background;
  if (!bg?.id) return null;
  return bg.url || `${apiBaseUrl}/drive/files/${encodeURIComponent(bg.id)}`;
}

/**
 * Check if a cached profile is still fresh.
 */
export function isProfileFresh(
  updatedAt: Date | null,
  ttl: number = DEFAULT_CACHE_TTL,
): boolean {
  if (!updatedAt) return false;
  return Date.now() - updatedAt.getTime() < ttl;
}
