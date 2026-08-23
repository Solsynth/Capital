<script setup lang="ts">
import {
  Activity,
  ArrowLeft,
  Clock,
  Gamepad2,
  RefreshCw,
  Server,
  Users,
  Wifi,
} from "@lucide/vue";

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
  <main class="min-h-[calc(100vh-var(--site-page-offset,64px))] bg-base-100">
    <div class="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div class="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <NuxtLink to="/products/goatcraft#status" class="btn btn-ghost btn-sm -ml-3 gap-2">
            <ArrowLeft class="h-4 w-4" />
            GoatCraft
          </NuxtLink>
          <p class="eyebrow mt-5 mb-2">GoatCraft</p>
          <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
            {{ t("goatCraft.stats.title") }}
          </h1>
          <p class="mt-2 opacity-65">{{ t("goatCraft.stats.desc") }}</p>
        </div>
        <button type="button" class="btn btn-outline btn-sm gap-2" :disabled="status === 'pending'" @click="refresh">
          <RefreshCw class="h-4 w-4" :class="status === 'pending' ? 'animate-spin' : ''" />
          刷新数据
        </button>
      </div>

      <template v-if="available && stats">
        <div class="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <span class="flex items-center gap-2 font-medium text-success">
            <span class="h-2 w-2 rounded-full bg-success" />
            服务器在线
          </span>
          <span class="opacity-50">更新于 {{ formatDate(stats.fetchedAt) }}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <section class="rounded-lg border border-base-content/10 bg-base-200 p-5 sm:p-6">
            <Users class="mb-5 h-5 w-5 text-primary" />
            <p class="text-sm opacity-60">{{ t("goatCraft.stats.online") }}</p>
            <p class="mt-1 text-4xl font-bold tabular-nums text-primary">{{ stats.onlineCount }}</p>
          </section>
          <section class="rounded-lg border border-base-content/10 bg-base-200 p-5 sm:p-6">
            <Gamepad2 class="mb-5 h-5 w-5 text-primary" />
            <p class="text-sm opacity-60">{{ t("goatCraft.stats.totalPlayers") }}</p>
            <p class="mt-1 text-4xl font-bold tabular-nums">{{ stats.totalPlayers ?? "—" }}</p>
          </section>
          <section class="rounded-lg border border-base-content/10 bg-base-200 p-5 sm:p-6">
            <Clock class="mb-5 h-5 w-5 text-primary" />
            <p class="text-sm opacity-60">{{ t("goatCraft.stats.serverUptime") }}</p>
            <p class="mt-1 text-3xl font-bold tabular-nums">{{ formatDuration(stats.serverUptimeMs) }}</p>
          </section>
          <section class="rounded-lg border border-base-content/10 bg-base-200 p-5 sm:p-6">
            <Wifi class="mb-5 h-5 w-5 text-primary" />
            <p class="text-sm opacity-60">{{ t("goatCraft.stats.websocket") }}</p>
            <p class="mt-1 truncate text-2xl font-bold capitalize">{{ stats.websocketState || "—" }}</p>
          </section>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section class="rounded-lg border border-base-content/10 bg-base-200 p-5 sm:p-6">
            <div class="mb-5 flex items-center justify-between gap-4">
              <div class="flex items-center gap-2 font-semibold">
                <Users class="h-5 w-5 text-primary" />
                {{ t("goatCraft.stats.playersOnline") }}
              </div>
              <span class="text-sm opacity-60">{{ stats.onlinePlayers.length }} 名已列出</span>
            </div>
            <div v-if="stats.onlinePlayers.length" class="flex flex-wrap gap-2">
              <span v-for="player in stats.onlinePlayers" :key="player.uuid || player.name" class="rounded-md border border-base-content/10 bg-base-100 px-3 py-2 text-sm font-medium">
                {{ player.name }}
              </span>
            </div>
            <p v-else class="rounded-lg border border-dashed border-base-content/15 px-4 py-10 text-center text-sm opacity-60">
              {{ t("goatCraft.stats.noPlayers") }}
            </p>
          </section>

          <section class="rounded-lg border border-base-content/10 bg-base-200 p-5 sm:p-6">
            <div class="mb-5 flex items-center gap-2 font-semibold">
              <Activity class="h-5 w-5 text-primary" />
              服务详情
            </div>
            <dl class="space-y-4 text-sm">
              <div class="flex items-center justify-between gap-4">
                <dt class="opacity-60">监控</dt>
                <dd>{{ stats.metricsEnabled ? "已启用" : "未启用" }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="opacity-60">API 运行时间</dt>
                <dd class="font-medium tabular-nums">{{ formatDuration(stats.apiUptimeMs) }}</dd>
              </div>
              <div class="border-t border-base-content/10 pt-4">
                <dt class="mb-1 opacity-60">API 启动时间</dt>
                <dd class="break-words font-medium">{{ formatDate(stats.apiStartedAt) }}</dd>
              </div>
            </dl>
          </section>
        </div>
      </template>

      <section v-else class="rounded-lg border border-base-content/10 bg-base-200 px-6 py-16 text-center">
        <Server class="mx-auto mb-4 h-10 w-10 opacity-35" />
        <h2 class="text-lg font-semibold">暂时无法取得服务器状态</h2>
        <p class="mt-2 text-sm opacity-60">
          {{ data?.reason === "not_configured" ? t("goatCraft.stats.notConfigured") : t("goatCraft.stats.unavailable") }}
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.5;
}
</style>
