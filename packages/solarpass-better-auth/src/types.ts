/**
 * Solar Network profile response from /stargate/accounts/me
 */
export interface SolarProfile {
  id: string;
  name: string;
  nick?: string;
  language?: string;
  region?: string;
  profile?: {
    picture?: { id: string; url?: string } | null;
    background?: { id: string; url?: string } | null;
    bio?: string | null;
    location?: string | null;
    timeZone?: string | null;
    email?: string | null;
    verification?: { title: string | null } | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Options for the solarpass() provider helper.
 */
export interface SolarpassProviderOptions {
  /**
   * OAuth client ID registered with Solarpass.
   */
  clientId: string;
  /**
   * OAuth client secret registered with Solarpass.
   */
  clientSecret: string;
  /**
   * Scopes to request. Defaults to ["openid", "profile", "email", "account.connections"].
   */
  scopes?: string[];
  /**
   * Custom redirect URI. Defaults to ${baseURL}/api/auth/oauth2/callback/solarpass.
   */
  redirectURI?: string;
  /**
   * Disable sign-up for new users.
   */
  disableSignUp?: boolean;
  /**
   * Disable implicit sign-up. Sign-in must be called with requestSignUp.
   */
  disableImplicitSignUp?: boolean;
  /**
   * Override user info on every sign-in.
   */
  overrideUserInfo?: boolean;
}

/**
 * Options for the solarpassPlugin (server-side profile caching).
 */
export interface SolarpassPluginOptions {
  /**
   * TTL for cached profiles in milliseconds. Defaults to 24h.
   */
  cacheTTL?: number;
  /**
   * Base URL for the Solar Network API.
   */
  apiBaseUrl?: string;
  /**
   * Custom function to map Solar Profile to user fields.
   */
  mapProfileToUser?: (profile: SolarProfile) => Record<string, any> | Promise<Record<string, any>>;
}
