<script setup lang="ts">
import {
  Activity,
  Bug,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Gamepad2,
  Images,
  KeyRound,
  MessageSquare,
  Pickaxe,
  Server,
  Shield,
  Sparkles,
  Star,
  Users,
  Wallet,
  Calendar,
  HardDrive,
  Play,
  BadgeCheck,
  Clock,
  Wifi,
} from "@lucide/vue";
import StarRating from "~/components/StarRating.vue";
import ReviewSummary from "~/components/ReviewSummary.vue";
import ReviewForm from "~/components/ReviewForm.vue";
import ReviewList from "~/components/ReviewList.vue";
import { useProductReviews } from "~/composables/useProductReviews";
import { useProductReviewSubmission } from "~/composables/useProductReviewSubmission";

const { t, locale } = useI18n();

const PRODUCT_SLUG = "goatcraft";
const SERVER_ADDRESS = "playmc.solsynth.dev";
const BEDROCK_SERVER_ADDRESS = "mc.cnlong.cc";
const AUTH_MC_URL = "https://authmc.solsynth.dev";
const STATS_POLL_MS = 15_000;
/** Current 周目 — update when the world resets. */
const CURRENT_PERIOD_ID = "period2";

type GoatcraftStatsPayload = {
  available: boolean;
  reason: "not_configured" | "upstream_error" | null;
  authMode?: "authorized" | "open" | null;
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

const {
  data: statsPayload,
  refresh: refreshStats,
  status: statsStatus,
} = await useFetch<GoatcraftStatsPayload>("/api/products/goatcraft/stats", {
  lazy: true,
  default: () => ({
    available: false,
    reason: "not_configured",
    stats: null,
  }),
});

const stats = computed(() => statsPayload.value?.stats ?? null);
const statsAvailable = computed(() => !!statsPayload.value?.available && !!stats.value);

function formatDuration(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return "—";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSec}s`;
}

const statsUpdatedLabel = computed(() => {
  const at = stats.value?.fetchedAt;
  if (!at) return "";
  try {
    return new Date(at).toLocaleTimeString(
      locale.value === "zh" ? "zh-CN" : "en-US",
      { hour: "2-digit", minute: "2-digit", second: "2-digit" },
    );
  } catch {
    return "";
  }
});

let statsPollTimer: ReturnType<typeof setInterval> | null = null;

/** Known periods (order matters). Gallery folders are auto-scanned on top of this. */
const KNOWN_PERIODS = [
  { id: "period1", status: "archived" as const },
  { id: "period2", status: "current" as const },
] as const;

const copied = ref(false);
/** Join auth path tabs: microsoft | solarpass | bedrock */
const authTab = ref<"microsoft" | "solarpass" | "bedrock">("microsoft");
/** Focused period for keyboard carousel controls */
const activePeriodId = ref(CURRENT_PERIOD_ID);
const carouselIndexByPeriod = reactive<Record<string, number>>({});
const thumbStripEls = new Map<string, HTMLElement>();

type GalleryPeriod = { id: string; images: string[] };

const { data: galleryData } = await useFetch<{ periods: GalleryPeriod[] }>(
  "/api/products/goatcraft/galleries",
  { default: () => ({ periods: [] }) },
);

const imagesByPeriod = computed(() => {
  const map = new Map<string, string[]>();
  for (const p of galleryData.value?.periods ?? []) {
    map.set(p.id, p.images);
  }
  return map;
});

const timelinePeriods = computed(() => {
  const fromDisk = new Set(
    (galleryData.value?.periods ?? []).map((p) => p.id),
  );
  const ids = new Set([
    ...KNOWN_PERIODS.map((p) => p.id),
    ...fromDisk,
  ]);

  return [...ids]
    .sort((a, b) => {
      const na = Number(a.replace(/\D/g, "")) || 0;
      const nb = Number(b.replace(/\D/g, "")) || 0;
      return na - nb;
    })
    .map((id) => {
      const known = KNOWN_PERIODS.find((p) => p.id === id);
      const status =
        known?.status ??
        (id === CURRENT_PERIOD_ID ? ("current" as const) : ("archived" as const));
      const images = imagesByPeriod.value.get(id) ?? [];
      return {
        id,
        status,
        images,
        imageCount: images.length,
      };
    });
});

function slideIndex(periodId: string) {
  return carouselIndexByPeriod[periodId] ?? 0;
}

function slideSrc(periodId: string) {
  const images = imagesByPeriod.value.get(periodId) ?? [];
  return images[slideIndex(periodId)] ?? null;
}

function bindThumbStrip(periodId: string, el: unknown) {
  if (el instanceof HTMLElement) thumbStripEls.set(periodId, el);
  else thumbStripEls.delete(periodId);
}

function selectPeriod(id: string) {
  activePeriodId.value = id;
}

function goToSlide(periodId: string, index: number) {
  const images = imagesByPeriod.value.get(periodId) ?? [];
  if (index < 0 || index >= images.length) return;
  carouselIndexByPeriod[periodId] = index;
  activePeriodId.value = periodId;
  scrollThumbIntoView(periodId, index);
}

function carouselPrev(periodId: string) {
  const images = imagesByPeriod.value.get(periodId) ?? [];
  if (!images.length) return;
  const next = (slideIndex(periodId) - 1 + images.length) % images.length;
  goToSlide(periodId, next);
}

function carouselNext(periodId: string) {
  const images = imagesByPeriod.value.get(periodId) ?? [];
  if (!images.length) return;
  const next = (slideIndex(periodId) + 1) % images.length;
  goToSlide(periodId, next);
}

function scrollThumbIntoView(periodId: string, index: number) {
  const strip = thumbStripEls.get(periodId);
  if (!strip) return;
  const thumb = strip.children[index] as HTMLElement | undefined;
  thumb?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
}

function onCarouselKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  if (target?.closest("input, textarea, [contenteditable]")) return;
  if (e.key === "ArrowLeft") carouselPrev(activePeriodId.value);
  if (e.key === "ArrowRight") carouselNext(activePeriodId.value);
}

onMounted(() => {
  window.addEventListener("keydown", onCarouselKey);
  statsPollTimer = setInterval(() => {
    void refreshStats();
  }, STATS_POLL_MS);
});
onUnmounted(() => {
  window.removeEventListener("keydown", onCarouselKey);
  if (statsPollTimer) {
    clearInterval(statsPollTimer);
    statsPollTimer = null;
  }
});

const aboutCards = [
  {
    icon: Users,
    bg: "bg-primary/20",
    iconClass: "text-primary",
    titleKey: "goatCraft.aboutCard.community.title",
    descKey: "goatCraft.aboutCard.community.desc",
  },
  {
    icon: Pickaxe,
    bg: "bg-secondary/20",
    iconClass: "text-secondary",
    titleKey: "goatCraft.aboutCard.survival.title",
    descKey: "goatCraft.aboutCard.survival.desc",
  },
  {
    icon: KeyRound,
    bg: "bg-accent/20",
    iconClass: "text-accent",
    titleKey: "goatCraft.aboutCard.auth.title",
    descKey: "goatCraft.aboutCard.auth.desc",
  },
] as const;

const features = [
  {
    key: "auth",
    icon: KeyRound,
    titleKey: "goatCraft.features.auth.title",
    descKey: "goatCraft.features.auth.desc",
  },
  {
    key: "microsoft",
    icon: BadgeCheck,
    titleKey: "goatCraft.features.microsoft.title",
    descKey: "goatCraft.features.microsoft.desc",
  },
  {
    key: "survival",
    icon: Pickaxe,
    titleKey: "goatCraft.features.survival.title",
    descKey: "goatCraft.features.survival.desc",
  },
  {
    key: "claims",
    icon: Shield,
    titleKey: "goatCraft.features.claims.title",
    descKey: "goatCraft.features.claims.desc",
  },
  {
    key: "economy",
    icon: Wallet,
    titleKey: "goatCraft.features.economy.title",
    descKey: "goatCraft.features.economy.desc",
  },
  {
    key: "events",
    icon: Calendar,
    titleKey: "goatCraft.features.events.title",
    descKey: "goatCraft.features.events.desc",
  },
  {
    key: "chat",
    icon: MessageSquare,
    titleKey: "goatCraft.features.chat.title",
    descKey: "goatCraft.features.chat.desc",
  },
  {
    key: "backups",
    icon: HardDrive,
    titleKey: "goatCraft.features.backups.title",
    descKey: "goatCraft.features.backups.desc",
  },
] as const;

const joinSteps = [
  {
    step: 1,
    icon: Copy,
    titleKey: "goatCraft.howToJoin.step1.title",
    descKey: "goatCraft.howToJoin.step1.desc",
  },
  {
    step: 2,
    icon: KeyRound,
    titleKey: "goatCraft.howToJoin.step2.title",
    descKey: "goatCraft.howToJoin.step2.desc",
  },
  {
    step: 3,
    icon: Sparkles,
    titleKey: "goatCraft.howToJoin.step3.title",
    descKey: "goatCraft.howToJoin.step3.desc",
  },
] as const;

const authTabs = [
  {
    id: "microsoft" as const,
    icon: BadgeCheck,
    labelKey: "goatCraft.auth.tabs.microsoft",
  },
  {
    id: "solarpass" as const,
    icon: KeyRound,
    labelKey: "goatCraft.auth.tabs.solarpass",
  },
  {
    id: "bedrock" as const,
    icon: Gamepad2,
    labelKey: "goatCraft.auth.tabs.bedrock",
  },
] as const;

const {
  reviews,
  summary,
  loading: reviewsLoading,
  sort,
  setSort,
  page,
  totalPages,
  nextPage,
  prevPage,
  refresh: refreshReviews,
} = useProductReviews(PRODUCT_SLUG);

const {
  myReview,
  loading: myReviewLoading,
  submitting,
  fetchMyReview,
  submit,
  update,
  remove,
} = useProductReviewSubmission(PRODUCT_SLUG);

const reviewFormOpen = ref(false);
const reviewForm = ref({
  rating: 0,
  title: "",
  content: "",
  isRecommended: null as boolean | null,
});

onMounted(() => {
  void Promise.all([fetchMyReview(), refreshReviews()]);
});

async function copyAddress(address = SERVER_ADDRESS) {
  try {
    await navigator.clipboard.writeText(address);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // clipboard may be unavailable
  }
}

function openReviewForm() {
  if (myReview.value) {
    reviewForm.value = {
      rating: myReview.value.rating,
      title: myReview.value.title || "",
      content: myReview.value.content || "",
      isRecommended: myReview.value.isRecommended,
    };
  } else {
    reviewForm.value = {
      rating: 0,
      title: "",
      content: "",
      isRecommended: null,
    };
  }
  reviewFormOpen.value = true;
}

async function handleSubmitReview() {
  if (reviewForm.value.rating === 0) return;
  try {
    if (myReview.value) {
      await update(reviewForm.value);
    } else {
      await submit(reviewForm.value);
    }
    reviewFormOpen.value = false;
    await refreshReviews();
  } catch {
    // error handled by composable
  }
}

async function handleDeleteReview() {
  try {
    await remove();
    reviewFormOpen.value = false;
    await refreshReviews();
  } catch {
    // error handled by composable
  }
}

async function handleHelpful(id: string) {
  await $fetch(`/api/products/${PRODUCT_SLUG}/reviews/${id}/helpful`, {
    method: "POST",
  });
  await refreshReviews();
}

definePageMeta({
  title: "GoatCraft",
  description: "Solsynth's official Minecraft server.",
});

useSeoMeta({
  description: () => t("goatCraft.tagline"),
});

defineOgImage("UniOgImage", {
  title: "GoatCraft",
  description: () => t("goatCraft.tagline"),
  iconImage: "/images/goatcraft/icon.png",
  backgroundImage: "/images/goatcraft/main-visual.png",
});
</script>

<template>
  <div class="goatcraft-page">
    <!-- Hero -->
    <section
      class="relative h-[60vh] min-h-100 overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <NuxtImg
        src="/images/goatcraft/main-visual.png"
        class="absolute inset-0 w-full h-full object-cover object-center -z-10 opacity-70"
        loading="eager"
        format="webp"
        alt=""
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/30 to-transparent"
      />

      <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
        <div
          class="container mx-auto flex flex-col md:flex-row md:items-end gap-4 md:gap-6"
        >
          <div class="flex items-center gap-4 min-w-0">
            <NuxtImg
              src="/images/goatcraft/icon.png"
              class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl shrink-0"
              alt="GoatCraft"
              width="96"
              height="96"
              format="webp"
            />
            <div class="min-w-0">
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-1">
                GoatCraft
              </h1>
              <p class="text-base sm:text-lg opacity-80 line-clamp-2">
                {{ t("goatCraft.tagline") }}
              </p>
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <span
                  v-if="statsAvailable"
                  class="badge badge-sm gap-1"
                  :class="
                    (stats?.onlineCount ?? 0) > 0
                      ? 'badge-success'
                      : 'badge-ghost'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="
                      (stats?.onlineCount ?? 0) > 0
                        ? 'bg-success-content animate-pulse'
                        : 'bg-base-content/40'
                    "
                  />
                  {{
                    t("goatCraft.stats.onlineCount", {
                      count: stats?.onlineCount ?? 0,
                    })
                  }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 md:ml-auto md:shrink-0">
            <a
              href="#join"
              class="btn btn-primary btn-sm sm:btn-md md:btn-lg rounded-full gap-2"
            >
              <Play class="w-4 h-4" />
              {{ t("goatCraft.join") }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="divider mt-0 h-px" />

    <!-- Live server stats -->
    <section id="status" class="container mx-auto px-4 pt-16 pb-8 scroll-mt-24">
      <div class="text-center mb-8">
        <span class="badge badge-success badge-outline mb-4 gap-1">
          <Activity class="w-3.5 h-3.5" />
          {{ t("goatCraft.stats.badge") }}
        </span>
        <h2 class="text-3xl sm:text-4xl font-bold mb-3">
          {{ t("goatCraft.stats.title") }}
        </h2>
        <p class="text-base opacity-70 max-w-2xl mx-auto">
          {{ t("goatCraft.stats.desc") }}
        </p>
        <NuxtLink to="/products/goatcraft/stats" class="btn btn-outline btn-sm mt-4 gap-2">
          <Activity class="w-4 h-4" />
          {{ t("goatCraft.stats.viewDetails") }}
        </NuxtLink>
      </div>

      <div
        v-if="statsAvailable && stats"
        class="max-w-4xl mx-auto space-y-4"
      >
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            class="card bg-base-200 border border-base-content/5 p-4 sm:p-5"
          >
            <div class="flex items-center gap-2 text-xs opacity-50 mb-2">
              <Users class="w-3.5 h-3.5" />
              {{ t("goatCraft.stats.online") }}
            </div>
            <p class="text-3xl font-bold tabular-nums text-primary">
              {{ stats.onlineCount }}
            </p>
          </div>
          <div
            class="card bg-base-200 border border-base-content/5 p-4 sm:p-5"
          >
            <div class="flex items-center gap-2 text-xs opacity-50 mb-2">
              <Gamepad2 class="w-3.5 h-3.5" />
              {{ t("goatCraft.stats.totalPlayers") }}
            </div>
            <p class="text-3xl font-bold tabular-nums">
              {{ stats.totalPlayers ?? "—" }}
            </p>
          </div>
          <div
            class="card bg-base-200 border border-base-content/5 p-4 sm:p-5"
          >
            <div class="flex items-center gap-2 text-xs opacity-50 mb-2">
              <Clock class="w-3.5 h-3.5" />
              {{ t("goatCraft.stats.serverUptime") }}
            </div>
            <p class="text-2xl sm:text-3xl font-bold tabular-nums">
              {{ formatDuration(stats.serverUptimeMs) }}
            </p>
          </div>
          <div
            class="card bg-base-200 border border-base-content/5 p-4 sm:p-5"
          >
            <div class="flex items-center gap-2 text-xs opacity-50 mb-2">
              <Wifi class="w-3.5 h-3.5" />
              {{ t("goatCraft.stats.websocket") }}
            </div>
            <p class="text-lg sm:text-xl font-semibold capitalize truncate">
              {{ stats.websocketState || "—" }}
            </p>
          </div>
        </div>

        <div
          class="card bg-base-200 border border-base-content/5 p-4 sm:p-5"
        >
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 class="font-semibold flex items-center gap-2">
              <Users class="w-4 h-4 text-primary" />
              {{ t("goatCraft.stats.playersOnline") }}
            </h3>
            <div class="flex flex-wrap items-center gap-2 text-xs opacity-50">
              <span v-if="stats.metricsEnabled !== null">
                {{ t("goatCraft.stats.metrics") }}:
                {{
                  stats.metricsEnabled
                    ? t("goatCraft.stats.metricsOn")
                    : t("goatCraft.stats.metricsOff")
                }}
              </span>
              <span v-if="stats.apiUptimeMs != null">
                · {{ t("goatCraft.stats.apiUptime") }}:
                {{ formatDuration(stats.apiUptimeMs) }}
              </span>
              <span v-if="statsUpdatedLabel">
                ·
                {{
                  t("goatCraft.stats.updatedAt", { time: statsUpdatedLabel })
                }}
              </span>
              <span v-if="statsStatus === 'pending'" class="opacity-70">
                {{ t("goatCraft.stats.refreshing") }}
              </span>
            </div>
          </div>

          <div
            v-if="stats.onlinePlayers.length === 0"
            class="rounded-xl border border-dashed border-base-content/10 py-8 text-center text-sm opacity-60"
          >
            {{ t("goatCraft.stats.noPlayers") }}
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <span
              v-for="player in stats.onlinePlayers"
              :key="player.uuid || player.name"
              class="badge badge-lg badge-outline gap-1.5 font-medium"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-success" />
              {{ player.name }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-else
        class="max-w-xl mx-auto card bg-base-200 border border-base-content/5 p-8 text-center"
      >
        <Server class="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p class="opacity-60">
          {{
            statsPayload?.reason === "not_configured"
              ? t("goatCraft.stats.notConfigured")
              : t("goatCraft.stats.unavailable")
          }}
        </p>
      </div>
    </section>

    <div class="divider" />

    <!-- About -->
    <section class="container mx-auto px-4 pt-8 pb-16">
      <div class="text-center mb-12">
        <span class="badge badge-primary badge-outline mb-4">{{
          t("goatCraft.about.badge")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("goatCraft.about.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-3xl mx-auto">
          {{ t("goatCraft.about.desc") }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="card in aboutCards"
          :key="card.titleKey"
          class="card rounded-xl bg-base-200 hover:bg-base-300 transition-all duration-300 p-8 border border-base-content/5"
        >
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            :class="card.bg"
          >
            <component :is="card.icon" class="w-8 h-8" :class="card.iconClass" />
          </div>
          <h3 class="text-xl font-bold mb-2">{{ t(card.titleKey) }}</h3>
          <p class="opacity-80">{{ t(card.descKey) }}</p>
        </div>
      </div>
    </section>

    <div class="divider" />

    <!-- History timeline + gallery (merged by 周目) -->
    <section
      id="history"
      class="container mx-auto px-4 py-16 scroll-mt-24"
      v-if="false"
    >
      <div class="text-center mb-12">
        <span class="badge badge-primary badge-outline mb-4">{{
          t("goatCraft.history.badge")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("goatCraft.history.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-2xl mx-auto">
          {{ t("goatCraft.history.desc") }}
        </p>
      </div>

      <div class="max-w-4xl mx-auto relative">
        <div
          class="absolute left-[1.15rem] top-3 bottom-3 w-px bg-base-content/10"
          aria-hidden="true"
        />

        <ol class="space-y-10">
          <li
            v-for="period in timelinePeriods"
            :key="period.id"
            :id="`period-${period.id}`"
            class="relative grid grid-cols-[2.25rem_1fr] gap-x-4 items-start scroll-mt-24"
            @pointerdown="selectPeriod(period.id)"
          >
            <div class="flex justify-center pt-6 relative z-10">
              <span
                class="w-4 h-4 rounded-full border-2 border-base-100 shadow"
                :class="
                  period.status === 'current'
                    ? 'bg-primary ring-4 ring-primary/20'
                    : activePeriodId === period.id
                      ? 'bg-primary/70 ring-4 ring-primary/10'
                      : 'bg-base-content/30'
                "
              />
            </div>

            <div
              class="card bg-base-200 border border-base-content/5 overflow-hidden"
              :class="
                period.status === 'current'
                  ? 'border-primary/30 ring-1 ring-primary/15'
                  : activePeriodId === period.id
                    ? 'border-primary/20'
                    : ''
              "
            >
              <div class="p-5 sm:p-6">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    class="badge badge-sm"
                    :class="
                      period.status === 'current'
                        ? 'badge-primary'
                        : 'badge-ghost'
                    "
                  >
                    {{ t(`goatCraft.periodStatus.${period.status}`) }}
                  </span>
                  <span class="text-xs opacity-50">
                    {{ t(`goatCraft.periods.${period.id}.date`) }}
                  </span>
                  <span
                    v-if="period.imageCount > 0"
                    class="text-xs opacity-50 flex items-center gap-1 ml-auto"
                  >
                    <Images class="w-3.5 h-3.5" />
                    {{
                      t("goatCraft.gallery.count", {
                        count: period.imageCount,
                      })
                    }}
                  </span>
                </div>
                <h3 class="text-lg sm:text-xl font-bold">
                  {{ t(`goatCraft.periods.${period.id}.title`) }}
                </h3>
                <p class="text-xs opacity-50 mb-2">
                  {{ t(`goatCraft.periods.${period.id}.subtitle`) }}
                </p>
                <p class="text-sm opacity-70 leading-relaxed">
                  {{ t(`goatCraft.periods.${period.id}.desc`) }}
                </p>
              </div>

              <!-- Per-period carousel -->
              <div
                v-if="period.images.length > 0"
                class="border-t border-base-content/5 p-3 sm:p-4 space-y-3 bg-base-300/30"
              >
                <div
                  class="relative overflow-hidden rounded-xl bg-base-300 aspect-[16/10] sm:aspect-video"
                >
                  <Transition name="carousel-fade" mode="out-in">
                    <NuxtImg
                      v-if="slideSrc(period.id)"
                      :key="slideSrc(period.id)!"
                      :src="slideSrc(period.id)!"
                      class="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      format="webp"
                      sizes="100vw md:90vw lg:896px"
                      :alt="t(`goatCraft.periods.${period.id}.title`)"
                    />
                  </Transition>

                  <div
                    class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent px-3 py-2.5 sm:px-4"
                  >
                    <p class="text-white/85 text-xs sm:text-sm tabular-nums">
                      {{
                        t("goatCraft.gallery.slide", {
                          current: slideIndex(period.id) + 1,
                          total: period.images.length,
                        })
                      }}
                    </p>
                  </div>

                  <button
                    type="button"
                    class="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2 bg-base-100/85 border-0 shadow-md hover:bg-base-100"
                    :aria-label="t('goatCraft.gallery.prev')"
                    @click.stop="carouselPrev(period.id)"
                  >
                    <ChevronLeft class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2 bg-base-100/85 border-0 shadow-md hover:bg-base-100"
                    :aria-label="t('goatCraft.gallery.next')"
                    @click.stop="carouselNext(period.id)"
                  >
                    <ChevronRight class="w-4 h-4" />
                  </button>
                </div>

                <div
                  v-if="period.images.length > 1"
                  class="flex justify-center gap-1.5 flex-wrap px-1"
                >
                  <button
                    v-for="(_, i) in period.images"
                    :key="i"
                    type="button"
                    class="h-1.5 rounded-full transition-all"
                    :class="
                      i === slideIndex(period.id)
                        ? 'w-5 bg-primary'
                        : 'w-1.5 bg-base-content/20 hover:bg-base-content/40'
                    "
                    :aria-label="
                      t('goatCraft.gallery.slide', {
                        current: i + 1,
                        total: period.images.length,
                      })
                    "
                    @click.stop="goToSlide(period.id, i)"
                  />
                </div>

                <div
                  :ref="(el) => bindThumbStrip(period.id, el)"
                  class="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth pb-0.5 snap-x snap-mandatory"
                >
                  <button
                    v-for="(src, i) in period.images"
                    :key="src"
                    type="button"
                    class="relative shrink-0 w-16 sm:w-20 aspect-[4/3] rounded-md overflow-hidden border-2 snap-start transition-all"
                    :class="
                      i === slideIndex(period.id)
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    "
                    @click.stop="goToSlide(period.id, i)"
                  >
                    <NuxtImg
                      :src="src"
                      class="w-full h-full object-cover"
                      loading="lazy"
                      format="webp"
                      width="120"
                      height="90"
                      :alt="
                        t('goatCraft.gallery.slide', {
                          current: i + 1,
                          total: period.images.length,
                        })
                      "
                    />
                  </button>
                </div>
              </div>

              <div
                v-else
                class="border-t border-base-content/5 px-5 py-8 sm:px-6 text-center"
              >
                <Images class="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p class="text-sm opacity-50">
                  {{ t("goatCraft.gallery.empty") }}
                </p>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- Features -->
    <section class="container mx-auto px-4 py-16">
      <div class="text-center mb-16">
        <span class="badge badge-secondary badge-outline mb-4">{{
          t("goatCraft.features.badge")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("goatCraft.features.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-2xl mx-auto">
          {{ t("goatCraft.features.desc") }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="feature in features"
          :key="feature.key"
          class="card bg-base-200 rounded-2xl border border-base-content/5 p-6 hover:shadow-lg transition-shadow"
        >
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
          >
            <component :is="feature.icon" class="w-5 h-5 text-primary" />
          </div>
          <h3 class="text-base font-semibold mb-2">
            {{ t(feature.titleKey) }}
          </h3>
          <p class="text-sm opacity-60 leading-relaxed">
            {{ t(feature.descKey) }}
          </p>
        </div>
      </div>

      <section class="mt-16 border-t border-base-content/10 pt-12">
        <div class="mx-auto mb-8 max-w-2xl text-center">
          <h3 class="text-2xl font-bold">Connected with Solar Network</h3>
          <p class="mt-3 text-base leading-relaxed opacity-70">
            GoatCraft 不只是一个独立的服务器。它与 Solar Network 社区保持连接，让游戏内外的交流、身份与动态自然衔接。
          </p>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div class="border border-base-content/5 bg-base-200 p-6">
            <MessageSquare class="mb-4 h-5 w-5 text-primary" />
            <h4 class="mb-2 font-semibold">同步聊天</h4>
            <p class="text-sm leading-relaxed opacity-70">
              游戏内聊天与 Solar Network 频道同步，无论在游戏里还是社区中，都能接上正在发生的对话。
            </p>
          </div>
          <div class="border border-base-content/5 bg-base-200 p-6">
            <Users class="mb-4 h-5 w-5 text-primary" />
            <h4 class="mb-2 font-semibold">社区动态</h4>
            <p class="text-sm leading-relaxed opacity-70">
              服务器活动、重要公告与玩家故事可以直接分享至社区，让更多同伴一起参与。
            </p>
          </div>
          <div class="border border-base-content/5 bg-base-200 p-6">
            <BadgeCheck class="mb-4 h-5 w-5 text-primary" />
            <h4 class="mb-2 font-semibold">账号联动</h4>
            <p class="text-sm leading-relaxed opacity-70">
              使用 Solarpass 登录即可关联你的社区身份，减少重复设置，专心开始冒险。
            </p>
          </div>
        </div>
      </section>
    </section>

    <div class="divider" />

    <!-- How to join + auth + server info -->
    <section id="join" class="container mx-auto px-4 py-16 scroll-mt-24">
      <div class="text-center mb-12">
        <span class="badge badge-accent badge-outline mb-4">{{
          t("goatCraft.howToJoin.badge")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("goatCraft.howToJoin.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-2xl mx-auto">
          {{ t("goatCraft.howToJoin.desc") }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div
          v-for="step in joinSteps"
          :key="step.step"
          class="card bg-base-200 border border-base-content/5 p-6 text-center"
        >
          <div
            class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative"
          >
            <component :is="step.icon" class="w-5 h-5 text-primary" />
            <span
              class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-content text-xs font-bold flex items-center justify-center"
            >
              {{ step.step }}
            </span>
          </div>
          <h3 class="font-semibold mb-2">{{ t(step.titleKey) }}</h3>
          <p class="text-sm opacity-60">{{ t(step.descKey) }}</p>
        </div>
      </div>

      <!-- Auth paths as tabs (3 ways) -->
      <div id="auth" class="max-w-3xl mx-auto mb-12 scroll-mt-24">
        <div class="text-center mb-6">
          <h3 class="text-xl sm:text-2xl font-bold mb-2">
            {{ t("goatCraft.auth.title") }}
          </h3>
          <p class="text-sm sm:text-base opacity-60 max-w-2xl mx-auto">
            {{ t("goatCraft.auth.desc") }}
          </p>
        </div>

        <div
          role="tablist"
          class="flex flex-wrap justify-center gap-2 mb-5"
        >
          <button
            v-for="tab in authTabs"
            :key="tab.id"
            type="button"
            role="tab"
            class="btn btn-sm sm:btn-md rounded-full gap-1.5"
            :class="
              authTab === tab.id ? 'btn-primary' : 'btn-ghost bg-base-200'
            "
            :aria-selected="authTab === tab.id"
            @click="authTab = tab.id"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ t(tab.labelKey) }}
          </button>
        </div>

        <div
          class="card bg-base-200 border border-base-content/5 p-6 sm:p-8"
          role="tabpanel"
        >
          <!-- Microsoft (Java) -->
          <div v-if="authTab === 'microsoft'" class="space-y-5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge badge-success badge-sm">{{
                t("goatCraft.auth.microsoft.badge")
              }}</span>
              <h4 class="text-lg font-bold">
                {{ t("goatCraft.auth.microsoft.title") }}
              </h4>
            </div>
            <p class="text-sm opacity-70 leading-relaxed">
              {{ t("goatCraft.auth.microsoft.desc") }}
            </p>
            <ol class="space-y-3">
              <li
                v-for="n in 3"
                :key="n"
                class="flex gap-3 text-sm"
              >
                <span
                  class="w-6 h-6 rounded-full bg-success/15 text-success text-xs font-bold flex items-center justify-center shrink-0"
                >
                  {{ n }}
                </span>
                <span class="opacity-80 leading-relaxed pt-0.5">
                  {{ t(`goatCraft.auth.microsoft.steps.${n}`) }}
                </span>
              </li>
            </ol>
          </div>

          <!-- Solarpass (Java only) -->
          <div v-else-if="authTab === 'solarpass'" class="space-y-5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge badge-primary badge-sm">{{
                t("goatCraft.auth.solarpass.badge")
              }}</span>
              <h4 class="text-lg font-bold">
                {{ t("goatCraft.auth.solarpass.title") }}
              </h4>
            </div>
            <p class="text-sm opacity-70 leading-relaxed">
              {{ t("goatCraft.auth.solarpass.desc") }}
            </p>
            <ol class="space-y-3">
              <li
                v-for="n in 3"
                :key="n"
                class="flex gap-3 text-sm"
              >
                <span
                  class="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0"
                >
                  {{ n }}
                </span>
                <span class="opacity-80 leading-relaxed pt-0.5">
                  {{ t(`goatCraft.auth.solarpass.steps.${n}`) }}
                </span>
              </li>
            </ol>
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <a
                :href="AUTH_MC_URL"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary rounded-full gap-2"
              >
                <ExternalLink class="w-4 h-4" />
                {{ t("goatCraft.auth.solarpass.cta") }}
              </a>
              <p class="text-xs opacity-50">
                {{ t("goatCraft.auth.solarpass.hint") }}
              </p>
            </div>
          </div>

          <!-- Bedrock (no Solarpass) -->
          <div v-else class="space-y-5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge badge-secondary badge-sm">{{
                t("goatCraft.auth.bedrock.badge")
              }}</span>
              <h4 class="text-lg font-bold">
                {{ t("goatCraft.auth.bedrock.title") }}
              </h4>
            </div>
            <p class="text-sm opacity-70 leading-relaxed">
              {{ t("goatCraft.auth.bedrock.desc") }}
            </p>
            <div
              class="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm"
            >
              {{ t("goatCraft.auth.bedrock.note") }}
            </div>
            <ol class="space-y-3">
              <li
                v-for="n in 3"
                :key="n"
                class="flex gap-3 text-sm"
              >
                <span
                  class="w-6 h-6 rounded-full bg-secondary/15 text-secondary text-xs font-bold flex items-center justify-center shrink-0"
                >
                  {{ n }}
                </span>
                <span class="opacity-80 leading-relaxed pt-0.5">
                  {{ t(`goatCraft.auth.bedrock.steps.${n}`) }}
                </span>
              </li>
            </ol>
          </div>

          <div
            class="mt-6 flex flex-col gap-3 border-t border-base-content/10 pt-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0">
              <p class="text-xs opacity-50">
                {{
                  authTab === "bedrock"
                    ? t("goatCraft.editionBedrock")
                    : t("goatCraft.editionJava")
                }}
              </p>
              <p class="font-mono text-xl font-bold tracking-wide text-primary sm:text-2xl">
                {{
                  authTab === "bedrock"
                    ? BEDROCK_SERVER_ADDRESS
                    : SERVER_ADDRESS
                }}
              </p>
            </div>
            <button
              type="button"
              class="btn btn-primary btn-sm shrink-0 gap-2"
              @click="copyAddress(authTab === 'bedrock' ? BEDROCK_SERVER_ADDRESS : SERVER_ADDRESS)"
            >
              <Check v-if="copied" class="w-4 h-4" />
              <Copy v-else class="w-4 h-4" />
              {{ copied ? t("goatCraft.copied") : t("goatCraft.copyAddress") }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="divider" />

    <!-- History gallery -->
    <section id="history" class="container mx-auto px-4 py-16 scroll-mt-24">
      <div class="mb-10 text-center">
        <h2 class="text-4xl font-bold">岁月史书</h2>
      </div>

      <div class="relative overflow-x-auto pb-4">
        <div
          class="absolute left-0 right-0 top-3 h-px bg-base-content/10"
          aria-hidden="true"
        />
        <ol class="relative flex w-max min-w-full gap-6 pt-8">
          <li
            v-for="period in timelinePeriods"
            :key="period.id"
            :id="`period-${period.id}`"
            class="relative w-[min(82vw,32rem)] shrink-0 scroll-mt-24"
            @pointerdown="selectPeriod(period.id)"
          >
            <span
              class="absolute -top-7 left-5 z-10 w-4 h-4 rounded-full border-2 border-base-100"
              :class="
                period.status === 'current'
                  ? 'bg-primary ring-4 ring-primary/20'
                  : activePeriodId === period.id
                    ? 'bg-primary/70 ring-4 ring-primary/10'
                    : 'bg-base-content/30'
              "
            />

            <article
              class="overflow-hidden rounded-lg border border-base-content/5 bg-base-200"
              :class="
                period.status === 'current'
                  ? 'border-primary/30 ring-1 ring-primary/15'
                  : activePeriodId === period.id
                    ? 'border-primary/20'
                    : ''
              "
            >
              <div class="p-5 sm:p-6">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    class="badge badge-sm"
                    :class="period.status === 'current' ? 'badge-primary' : 'badge-ghost'"
                  >
                    {{ t(`goatCraft.periodStatus.${period.status}`) }}
                  </span>
                  <span class="text-xs opacity-50">
                    {{ t(`goatCraft.periods.${period.id}.date`) }}
                  </span>
                  <span
                    v-if="period.imageCount > 0"
                    class="ml-auto flex items-center gap-1 text-xs opacity-50"
                  >
                    <Images class="w-3.5 h-3.5" />
                    {{ t("goatCraft.gallery.count", { count: period.imageCount }) }}
                  </span>
                </div>
                <h3 class="text-lg font-bold sm:text-xl">
                  {{ t(`goatCraft.periods.${period.id}.title`) }}
                </h3>
                <p class="mb-2 text-xs opacity-50">
                  {{ t(`goatCraft.periods.${period.id}.subtitle`) }}
                </p>
                <p class="text-sm leading-relaxed opacity-70">
                  {{ t(`goatCraft.periods.${period.id}.desc`) }}
                </p>
              </div>

              <div
                v-if="period.images.length > 0"
                class="space-y-3 border-t border-base-content/5 bg-base-300/30 p-3 sm:p-4"
              >
                <div class="relative aspect-video overflow-hidden bg-base-300">
                  <Transition name="carousel-fade" mode="out-in">
                    <NuxtImg
                      v-if="slideSrc(period.id)"
                      :key="slideSrc(period.id)!"
                      :src="slideSrc(period.id)!"
                      class="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      format="webp"
                      width="1024"
                      height="576"
                      fit="cover"
                      sizes="82vw md:32rem"
                      :alt="t(`goatCraft.periods.${period.id}.title`)"
                    />
                  </Transition>
                  <button
                    type="button"
                    class="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2 bg-base-100/85 border-0"
                    :aria-label="t('goatCraft.gallery.prev')"
                    @click.stop="carouselPrev(period.id)"
                  >
                    <ChevronLeft class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2 bg-base-100/85 border-0"
                    :aria-label="t('goatCraft.gallery.next')"
                    @click.stop="carouselNext(period.id)"
                  >
                    <ChevronRight class="w-4 h-4" />
                  </button>
                </div>
                <div
                  :ref="(el) => bindThumbStrip(period.id, el)"
                  class="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth"
                >
                  <button
                    v-for="(src, i) in period.images"
                    :key="src"
                    type="button"
                    class="relative shrink-0 w-16 aspect-[4/3] overflow-hidden rounded-md border-2"
                    :class="i === slideIndex(period.id) ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'"
                    @click.stop="goToSlide(period.id, i)"
                  >
                    <NuxtImg
                      :src="src"
                      class="h-full w-full object-cover"
                      loading="lazy"
                      format="webp"
                      width="120"
                      height="90"
                      :alt="t('goatCraft.gallery.slide', { current: i + 1, total: period.images.length })"
                    />
                  </button>
                </div>
              </div>

              <div
                v-else
                class="border-t border-base-content/5 px-5 py-8 text-center"
              >
                <Images class="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p class="text-sm opacity-50">{{ t("goatCraft.gallery.empty") }}</p>
              </div>
            </article>
          </li>
        </ol>
      </div>
    </section>

    <div class="divider" />

    <!-- Reviews -->
    <section class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <span class="badge badge-primary badge-outline mb-4">{{
          t("reviews.title")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">{{ t("reviews.title") }}</h2>
        <p class="text-lg opacity-70 max-w-2xl mx-auto">
          {{ t("reviews.shareExperience") }}
        </p>
      </div>

      <div
        class="grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] gap-6 lg:gap-8 items-start"
      >
        <aside
          class="card bg-base-200 border border-base-content/5 p-6 lg:sticky lg:top-24"
        >
          <ReviewSummary
            v-if="summary"
            :average="summary.average"
            :count="summary.count"
            :distribution="{
              fiveStar: summary.fiveStar,
              fourStar: summary.fourStar,
              threeStar: summary.threeStar,
              twoStar: summary.twoStar,
              oneStar: summary.oneStar,
            }"
          />
          <div
            v-else-if="reviewsLoading || myReviewLoading"
            class="animate-pulse space-y-3 py-2"
          >
            <div class="h-10 w-16 bg-base-300 rounded mx-auto" />
            <div class="h-3 w-full bg-base-300 rounded" />
            <div class="h-3 w-full bg-base-300 rounded" />
            <div class="h-3 w-4/5 bg-base-300 rounded" />
          </div>
          <div v-else class="text-center py-2">
            <p class="text-3xl font-bold tabular-nums mb-1">&mdash;</p>
            <p class="text-xs opacity-50">
              {{ t("reviews.summary.count", { count: 0 }) }}
            </p>
          </div>

          <div class="divider my-4" />

          <div v-if="myReview && !myReviewLoading" class="mb-4">
            <p class="text-xs opacity-50 mb-2">{{ t("reviews.editReview") }}</p>
            <div
              class="flex items-center gap-2 rounded-lg bg-base-100 border border-base-content/5 px-3 py-2"
            >
              <StarRating :model-value="myReview.rating" size="xs" readonly />
              <span class="text-sm font-medium tabular-nums"
                >{{ myReview.rating }}/5</span
              >
            </div>
          </div>

          <div v-if="!myReviewLoading">
            <ReviewForm
              v-model="reviewForm"
              v-model:open="reviewFormOpen"
              :submitting="submitting"
              :existing-review="!!myReview"
              @submit="handleSubmitReview"
              @delete="handleDeleteReview"
            >
              <template #trigger>
                <button
                  v-if="!myReview"
                  type="button"
                  class="btn btn-primary w-full gap-2"
                  @click="openReviewForm"
                >
                  <Star class="w-4 h-4" />
                  {{ t("reviews.writeReview") }}
                </button>
                <button
                  v-else
                  type="button"
                  class="btn btn-outline w-full gap-2"
                  @click="openReviewForm"
                >
                  <Star class="w-4 h-4" />
                  {{ t("reviews.editReview") }}
                </button>
              </template>
            </ReviewForm>
          </div>
          <div v-else class="h-10 bg-base-300 rounded-lg animate-pulse" />
        </aside>

        <div class="min-w-0">
          <ReviewList
            :reviews="reviews"
            :sort="sort"
            :loading="reviewsLoading"
            :page="page"
            :total-pages="totalPages"
            @update:sort="setSort"
            @helpful="handleHelpful"
            @next-page="nextPage"
            @prev-page="prevPage"
          />
        </div>
      </div>
    </section>

    <!-- Help -->
    <section class="container mx-auto px-4 py-16">
      <div class="card bg-base-200 p-8">
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h2 class="text-3xl font-bold mb-2">
              {{ t("goatCraft.help.title") }}
            </h2>
            <p class="text-lg opacity-80">
              {{ t("goatCraft.help.desc") }}
            </p>
          </div>
          <div class="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:lily@solsynth.dev"
              class="btn btn-outline btn-lg gap-2"
            >
              <Bug class="w-5 h-5" />
              lily@solsynth.dev
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.goatcraft-page {
  --color-primary: oklch(55% 0.12 130deg);
  --color-primary-content: oklch(98% 0.02 130deg);
}

:global([data-theme="dark"]) .goatcraft-page {
  --color-primary: oklch(70% 0.12 130deg);
  --color-primary-content: oklch(20% 0.04 130deg);
}

.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.25s ease;
}

.carousel-fade-enter-from,
.carousel-fade-leave-to {
  opacity: 0;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
