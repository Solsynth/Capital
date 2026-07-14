/**
 * Proxy for the GoatCraft plugin HTTP API: GET /v1/stats
 *
 * Configure via runtime config (env):
 *   NUXT_GOATCRAFT_API_URL    e.g. http://127.0.0.1:8080  (required)
 *   NUXT_GOATCRAFT_API_TOKEN  optional Bearer token
 *
 * Auth modes:
 *   - Authorized: set NUXT_GOATCRAFT_API_TOKEN → Authorization: Bearer <token>
 *   - Non-authorized: leave token empty → call /v1/stats with no auth header
 *     (matches plugin when API auth is disabled)
 */

export type GoatcraftOnlinePlayer = {
  name: string;
  uuid?: string;
};

export type GoatcraftStats = {
  onlineCount: number;
  onlinePlayers: GoatcraftOnlinePlayer[];
  totalPlayers: number | null;
  metricsEnabled: boolean | null;
  serverUptimeMs: number | null;
  apiStartedAt: string | null;
  apiUptimeMs: number | null;
  websocketState: string | null;
  serverTimeMs: number | null;
  fetchedAt: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  return null;
}

function normalizePlayer(entry: unknown): GoatcraftOnlinePlayer | null {
  if (typeof entry === "string" && entry.trim()) {
    return { name: entry.trim() };
  }
  const obj = asRecord(entry);
  if (!obj) return null;
  const name =
    asString(obj.name) ||
    asString(obj.username) ||
    asString(obj.displayName) ||
    asString(obj.player_name);
  if (!name) return null;
  const uuid = asString(obj.uuid) || asString(obj.id) || undefined;
  return { name, uuid };
}

function normalizeOnlinePlayers(raw: unknown): {
  count: number;
  players: GoatcraftOnlinePlayer[];
} {
  if (Array.isArray(raw)) {
    const players = raw
      .map(normalizePlayer)
      .filter((p): p is GoatcraftOnlinePlayer => p !== null);
    return { count: players.length, players };
  }

  const obj = asRecord(raw);
  if (!obj) return { count: 0, players: [] };

  const listRaw =
    obj.list ?? obj.players ?? obj.online_players ?? obj.onlinePlayers ?? [];
  const players = Array.isArray(listRaw)
    ? listRaw
        .map(normalizePlayer)
        .filter((p): p is GoatcraftOnlinePlayer => p !== null)
    : [];

  const count =
    asNumber(obj.count) ??
    asNumber(obj.online) ??
    asNumber(obj.online_count) ??
    asNumber(obj.size) ??
    players.length;

  return { count: Math.max(count, 0), players };
}

function normalizeStats(raw: unknown): GoatcraftStats {
  const body = asRecord(raw) ?? {};
  const online = normalizeOnlinePlayers(
    body.online_players ?? body.onlinePlayers ?? body.online,
  );

  const totalPlayers =
    asNumber(body.total_players) ??
    asNumber(body.totalPlayers) ??
    asNumber(body.unique_players) ??
    null;

  const apiStartedRaw =
    body.api_started_at ?? body.apiStartedAt ?? body.api_started_at_ms;
  let apiStartedAt: string | null = null;
  if (typeof apiStartedRaw === "string") {
    apiStartedAt = apiStartedRaw;
  } else {
    const ms = asNumber(apiStartedRaw);
    if (ms !== null) apiStartedAt = new Date(ms).toISOString();
  }

  return {
    onlineCount: online.count,
    onlinePlayers: online.players,
    totalPlayers,
    metricsEnabled:
      asBoolean(body.metrics_enabled) ?? asBoolean(body.metricsEnabled),
    serverUptimeMs:
      asNumber(body.server_uptime_ms) ?? asNumber(body.serverUptimeMs),
    apiStartedAt,
    apiUptimeMs: asNumber(body.api_uptime_ms) ?? asNumber(body.apiUptimeMs),
    websocketState:
      asString(body.websocket_state) ?? asString(body.websocketState),
    serverTimeMs: asNumber(body.server_time_ms) ?? asNumber(body.serverTimeMs),
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchUpstreamStats(baseUrl: string, token: string | null) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return $fetch<unknown>(`${baseUrl}/v1/stats`, {
    headers,
    timeout: 8_000,
  });
}

function isAuthFailure(err: unknown): boolean {
  const status =
    (err as { statusCode?: number; status?: number })?.statusCode ??
    (err as { statusCode?: number; status?: number })?.status ??
    (err as { response?: { status?: number } })?.response?.status;
  return status === 401 || status === 403;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const baseUrl = String(config.goatcraftApiUrl || "").replace(/\/$/, "");
  // Token is optional — empty/whitespace means non-authorized mode
  const token = String(config.goatcraftApiToken || "").trim() || null;

  if (!baseUrl) {
    return {
      available: false as const,
      reason: "not_configured" as const,
      stats: null,
      authMode: null,
    };
  }

  try {
    let raw: unknown;
    let authMode: "authorized" | "open" = token ? "authorized" : "open";

    try {
      raw = await fetchUpstreamStats(baseUrl, token);
    } catch (err) {
      // If a token was set but the API is running open (or token is wrong),
      // fall back to non-authorized mode once.
      if (token && isAuthFailure(err)) {
        raw = await fetchUpstreamStats(baseUrl, null);
        authMode = "open";
      } else {
        throw err;
      }
    }

    return {
      available: true as const,
      reason: null,
      stats: normalizeStats(raw),
      authMode,
    };
  } catch (err) {
    console.warn("[goatcraft/stats] upstream failed", err);
    return {
      available: false as const,
      reason: "upstream_error" as const,
      stats: null,
      authMode: token ? ("authorized" as const) : ("open" as const),
    };
  }
});
