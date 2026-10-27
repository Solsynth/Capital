<script setup lang="ts">
import { ArrowLeft, RefreshCw, Server } from "@lucide/vue";

type StatsPayload = {
  available: boolean;
  reason: "not_configured" | "upstream_error" | null;
  stats: {
    onlineCount: number;
    onlinePlayers: { name: string; uuid?: string }[];
    totalPlayers: number | null;
    metricsEnabled: boolean | null;
    serverUptimeMs: number | null;
    apiStartedAt: string | null;
    apiUptimeMs: number | null;
    websocketState: string | null;
    serverTimeMs: number | null;
    fetchedAt: string;
  } | null;
};

const { t, locale } = useI18n();
const { data, refresh, status } = await useFetch<StatsPayload>(
  "/api/products/goatcraft/stats",
  {
    lazy: true,
    default: () => ({ available: false, reason: "not_configured", stats: null }),
  },
);

const stats = computed(() => data.value?.stats ?? null);
const available = computed(() => data.value?.available && stats.value);
let refreshTimer: ReturnType<typeof setInterval> | null = null;

function formatDuration(ms: number | null | undefined) {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return "—";
  const seconds = Math.floor(ms / 1_000);
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(locale.value === "zh" ? "zh-CN" : "en-US");
}

onMounted(() => {
  refreshTimer = setInterval(() => void refresh(), 15_000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});

definePageMeta({
  title: "GoatCraft Server Stats",
  description: "Live GoatCraft server status and player activity.",
});

useSeoMeta({ title: "GoatCraft Server Stats" });
</script>

<template>
  <main class="stats-page">
    <div class="shell">
      <header class="stats-head">
        <div>
          <NuxtLink
            to="/products/goatcraft#status"
            class="link-quiet back"
          >
            <ArrowLeft class="back-icon" aria-hidden="true" />
            GoatCraft
          </NuxtLink>
          <h1 class="title stats-title">
            {{ t("goatCraft.stats.title") }}
          </h1>
          <p class="stats-lede">
            {{ t("goatCraft.stats.desc") }}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-sm gap-2"
          :disabled="status === 'pending'"
          @click="refresh"
        >
          <RefreshCw
            class="refresh-icon"
            :class="status === 'pending' ? 'is-spinning' : ''"
            aria-hidden="true"
          />
          {{ t("goatCraft.stats.refresh") }}
        </button>
      </header>

      <template v-if="available && stats">
        <p class="status-line">
          <span class="dot status-dot" />
          <span>{{ t("goatCraft.stats.serverOnline") }}</span>
          <span class="mono status-stamp">{{ formatDate(stats.fetchedAt) }}</span>
        </p>

        <dl class="readout">
          <div class="readout-cell">
            <dt class="readout-label">{{ t("goatCraft.stats.online") }}</dt>
            <dd class="readout-figure is-lead">
              {{ stats.onlineCount }}
            </dd>
          </div>
          <div class="readout-cell">
            <dt class="readout-label">
              {{ t("goatCraft.stats.totalPlayers") }}
            </dt>
            <dd class="readout-figure">
              {{ stats.totalPlayers ?? "—" }}
            </dd>
          </div>
          <div class="readout-cell">
            <dt class="readout-label">
              {{ t("goatCraft.stats.serverUptime") }}
            </dt>
            <dd class="readout-figure">
              {{ formatDuration(stats.serverUptimeMs) }}
            </dd>
          </div>
          <div class="readout-cell">
            <dt class="readout-label">
              {{ t("goatCraft.stats.websocket") }}
            </dt>
            <dd class="readout-figure">
              {{ stats.websocketState || "—" }}
            </dd>
          </div>
        </dl>

        <div class="detail-grid">
          <section class="detail">
            <div class="detail-head">
              <h2 class="detail-title">
                {{ t("goatCraft.stats.playersOnline") }}
              </h2>
              <span class="mono">{{ stats.onlinePlayers.length }}</span>
            </div>
            <ul v-if="stats.onlinePlayers.length" class="player-list">
              <li
                v-for="player in stats.onlinePlayers"
                :key="player.uuid || player.name"
                class="player"
              >
                <span class="dot player-dot" />
                {{ player.name }}
              </li>
            </ul>
            <p v-else class="detail-empty">
              {{ t("goatCraft.stats.noPlayers") }}
            </p>
          </section>

          <section class="detail">
            <h2 class="detail-title">
              {{ t("goatCraft.serverInfo.title") }}
            </h2>
            <table class="ledger">
              <tbody>
                <tr>
                  <th scope="row">{{ t("goatCraft.stats.metrics") }}</th>
                  <td>{{ stats.metricsEnabled ? t("goatCraft.stats.metricsOn") : t("goatCraft.stats.metricsOff") }}</td>
                </tr>
                <tr>
                  <th scope="row">{{ t("goatCraft.stats.apiUptime") }}</th>
                  <td class="mono">{{ formatDuration(stats.apiUptimeMs) }}</td>
                </tr>
                <tr>
                  <th scope="row">{{ t("goatCraft.stats.apiStartedAt") }}</th>
                  <td class="mono">
                    {{ stats.apiStartedAt ? formatDate(stats.apiStartedAt) : "—" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </template>

      <section v-else class="stats-unavailable">
        <Server class="empty-icon" aria-hidden="true" />
        <h2 class="detail-title">
          {{ t("goatCraft.stats.unavailableTitle") }}
        </h2>
        <p class="detail-empty">
          {{
            data?.reason === "not_configured"
              ? t("goatCraft.stats.notConfigured")
              : t("goatCraft.stats.unavailable")
          }}
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.stats-page {
  padding-block: 2.5rem 4rem;
}

.stats-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

.back-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.stats-title {
  margin: 1.25rem 0 0;
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
}

.stats-lede {
  margin: 0.6rem 0 0;
  max-width: 32rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-dim);
}

.refresh-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.status-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-dot,
.player-dot {
  background: var(--color-success);
}

.status-stamp {
  margin-left: 0.35rem;
}

.readout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-card);
  background: var(--color-line-soft);
}

.readout-cell {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 1rem 1.15rem 1.15rem;
  background: var(--color-base-100);
}

.readout-label {
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.readout-figure {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.readout-figure.is-lead {
  color: var(--color-primary);
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
  margin-top: 2.5rem;
}

.detail-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.detail-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.player-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.player {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9375rem;
  font-weight: 600;
}

.detail-empty {
  margin: 0.75rem 0 0;
  font-size: 0.9375rem;
  color: var(--color-faint);
}

.ledger {
  margin-top: 1rem;
}

.ledger th {
  text-align: left;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-faint);
  letter-spacing: 0;
}

.stats-unavailable {
  padding-top: 2rem;
  border-top: 1px solid var(--color-line-soft);
}

.empty-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-faint);
}

@media (min-width: 640px) {
  .readout {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .stats-page {
    padding-block: 3rem 5rem;
  }

  .detail-grid {
    grid-template-columns: minmax(0, 1fr) 22rem;
    gap: 3.5rem;
  }
}
</style>
