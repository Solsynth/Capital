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
const statsAvailable = computed(
  () => !!statsPayload.value?.available && !!stats.value,
);

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
/** Track broken gallery srcs so we can fall back gracefully */
const brokenImages = ref(new Set<string>());

type GalleryPeriod = { id: string; images: string[] };

const { data: galleryData } = await useFetch<{ periods: GalleryPeriod[] }>(
  "/api/products/goatcraft/galleries",
  {
    key: "goatcraft-galleries",
    default: () => ({ periods: [] }),
  },
);

/**
 * Gallery screenshots use multi-dot Minecraft filenames
 * (e.g. 2025-10-06_02.58.02.png). Serving them through NuxtImg + IPX
 * (especially format=webp) often fails, so the template uses native <img>
 * against static public URLs returned by the galleries API.
 */
const imagesByPeriod = computed(() => {
  const map = new Map<string, string[]>();
  for (const p of galleryData.value?.periods ?? []) {
    map.set(p.id, (p.images ?? []).filter(Boolean));
  }
  return map;
});

const timelinePeriods = computed(() => {
  const fromDisk = new Set(
    (galleryData.value?.periods ?? []).map((p) => p.id),
  );
  const ids = new Set([...KNOWN_PERIODS.map((p) => p.id), ...fromDisk]);

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
        (id === CURRENT_PERIOD_ID
          ? ("current" as const)
          : ("archived" as const));
      const images = (imagesByPeriod.value.get(id) ?? []).filter(
        (src) => !brokenImages.value.has(src),
      );
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
  const filtered = images.filter((src) => !brokenImages.value.has(src));
  if (!filtered.length) return null;
  const idx = Math.min(slideIndex(periodId), filtered.length - 1);
  return filtered[idx] ?? null;
}

function onGalleryImageError(src: string) {
  if (!src || brokenImages.value.has(src)) return;
  const next = new Set(brokenImages.value);
  next.add(src);
  brokenImages.value = next;
}

function bindThumbStrip(periodId: string, el: unknown) {
  if (el instanceof HTMLElement) thumbStripEls.set(periodId, el);
  else thumbStripEls.delete(periodId);
}

function selectPeriod(id: string) {
  activePeriodId.value = id;
}

function visibleImages(periodId: string) {
  return (imagesByPeriod.value.get(periodId) ?? []).filter(
    (src) => !brokenImages.value.has(src),
  );
}

function goToSlide(periodId: string, index: number) {
  const images = visibleImages(periodId);
  if (index < 0 || index >= images.length) return;
  carouselIndexByPeriod[periodId] = index;
  activePeriodId.value = periodId;
  scrollThumbIntoView(periodId, index);
}

function carouselPrev(periodId: string) {
  const images = visibleImages(periodId);
  if (!images.length) return;
  const next = (slideIndex(periodId) - 1 + images.length) % images.length;
  goToSlide(periodId, next);
}

function carouselNext(periodId: string) {
  const images = visibleImages(periodId);
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

const aboutCards = [
  {
    icon: Users,
    titleKey: "goatCraft.aboutCard.community.title",
    descKey: "goatCraft.aboutCard.community.desc",
  },
  {
    icon: Pickaxe,
    titleKey: "goatCraft.aboutCard.survival.title",
    descKey: "goatCraft.aboutCard.survival.desc",
  },
  {
    icon: KeyRound,
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

const solarLinks = [
  {
    key: "chat",
    icon: MessageSquare,
    titleKey: "goatCraft.solar.chat.title",
    descKey: "goatCraft.solar.chat.desc",
  },
  {
    key: "community",
    icon: Users,
    titleKey: "goatCraft.solar.community.title",
    descKey: "goatCraft.solar.community.desc",
  },
  {
    key: "account",
    icon: BadgeCheck,
    titleKey: "goatCraft.solar.account.title",
    descKey: "goatCraft.solar.account.desc",
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
  window.addEventListener("keydown", onCarouselKey);
  statsPollTimer = setInterval(() => {
    void refreshStats();
  }, STATS_POLL_MS);
  void Promise.all([fetchMyReview(), refreshReviews()]);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onCarouselKey);
  if (statsPollTimer) {
    clearInterval(statsPollTimer);
    statsPollTimer = null;
  }
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

const activeServerAddress = computed(() =>
  authTab.value === "bedrock" ? BEDROCK_SERVER_ADDRESS : SERVER_ADDRESS,
);

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
      class="relative h-[52vh] min-h-[22rem] max-h-[36rem] overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <NuxtImg
        src="/images/goatcraft/main-visual.png"
        class="absolute inset-0 w-full h-full object-cover object-center -z-10 opacity-60"
        width="1920"
        height="1080"
        loading="eager"
        fetchpriority="high"
        format="webp"
        alt=""
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/40 to-base-100/10"
      />

      <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
        <div
          class="container mx-auto flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div class="flex min-w-0 items-center gap-4">
            <NuxtImg
              src="/images/goatcraft/icon.png"
              class="h-16 w-16 shrink-0 rounded-xl border border-base-content/10 shadow-lg sm:h-20 sm:w-20"
              alt="GoatCraft"
              width="80"
              height="80"
              format="webp"
            />
            <div class="min-w-0">
              <div class="mb-1 flex flex-wrap items-center gap-2">
                <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
                  GoatCraft
                </h1>
                <span
                  v-if="statsAvailable"
                  class="inline-flex items-center gap-1.5 rounded-md border border-base-content/10 bg-base-100/80 px-2 py-0.5 text-xs font-medium backdrop-blur-sm"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="
                      (stats?.onlineCount ?? 0) > 0
                        ? 'bg-success animate-pulse'
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
              <p class="max-w-xl text-sm opacity-75 sm:text-base">
                {{ t("goatCraft.tagline") }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <a href="#join" class="btn btn-primary gap-2">
              <Play class="h-4 w-4" />
              {{ t("goatCraft.join") }}
            </a>
            <a href="#history" class="btn btn-ghost border border-base-content/10 gap-2">
              <Images class="h-4 w-4" />
              {{ t("goatCraft.history.title") }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Live server stats -->
    <section id="status" class="container mx-auto scroll-mt-24 px-4 py-12">
      <div
        class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h2 class="text-2xl font-bold sm:text-3xl">
            {{ t("goatCraft.stats.title") }}
          </h2>
          <p class="mt-1 max-w-xl text-sm opacity-60">
            {{ t("goatCraft.stats.desc") }}
          </p>
        </div>
        <NuxtLink
          to="/products/goatcraft/stats"
          class="btn btn-sm btn-ghost border border-base-content/10 gap-2 self-start sm:self-auto"
        >
          <Activity class="h-4 w-4" />
          {{ t("goatCraft.stats.viewDetails") }}
        </NuxtLink>
      </div>

      <div v-if="statsAvailable && stats" class="space-y-4">
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div
            class="rounded-lg border border-base-content/10 bg-base-200 p-4"
          >
            <div class="mb-2 flex items-center gap-1.5 text-xs opacity-50">
              <Users class="h-3.5 w-3.5" />
              {{ t("goatCraft.stats.online") }}
            </div>
            <p class="text-3xl font-bold tabular-nums text-primary">
              {{ stats.onlineCount }}
            </p>
          </div>
          <div
            class="rounded-lg border border-base-content/10 bg-base-200 p-4"
          >
            <div class="mb-2 flex items-center gap-1.5 text-xs opacity-50">
              <Gamepad2 class="h-3.5 w-3.5" />
              {{ t("goatCraft.stats.totalPlayers") }}
            </div>
            <p class="text-3xl font-bold tabular-nums">
              {{ stats.totalPlayers ?? "—" }}
            </p>
          </div>
          <div
            class="rounded-lg border border-base-content/10 bg-base-200 p-4"
          >
            <div class="mb-2 flex items-center gap-1.5 text-xs opacity-50">
              <Clock class="h-3.5 w-3.5" />
              {{ t("goatCraft.stats.serverUptime") }}
            </div>
            <p class="text-2xl font-bold tabular-nums sm:text-3xl">
              {{ formatDuration(stats.serverUptimeMs) }}
            </p>
          </div>
          <div
            class="rounded-lg border border-base-content/10 bg-base-200 p-4"
          >
            <div class="mb-2 flex items-center gap-1.5 text-xs opacity-50">
              <Wifi class="h-3.5 w-3.5" />
              {{ t("goatCraft.stats.websocket") }}
            </div>
            <p class="truncate text-lg font-semibold capitalize sm:text-xl">
              {{ stats.websocketState || "—" }}
            </p>
          </div>
        </div>

        <div class="rounded-lg border border-base-content/10 bg-base-200 p-4">
          <div
            class="mb-3 flex flex-wrap items-center justify-between gap-2"
          >
            <h3 class="flex items-center gap-2 text-sm font-semibold">
              <Users class="h-4 w-4 text-primary" />
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
            class="rounded-md border border-dashed border-base-content/15 py-8 text-center text-sm opacity-60"
          >
            {{ t("goatCraft.stats.noPlayers") }}
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <span
              v-for="player in stats.onlinePlayers"
              :key="player.uuid || player.name"
              class="inline-flex items-center gap-1.5 rounded-md border border-base-content/10 bg-base-100 px-2.5 py-1 text-sm font-medium"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-success" />
              {{ player.name }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-else
        class="mx-auto max-w-lg rounded-lg border border-base-content/10 bg-base-200 p-8 text-center"
      >
        <Server class="mx-auto mb-3 h-9 w-9 opacity-30" />
        <p class="text-sm opacity-60">
          {{
            statsPayload?.reason === "not_configured"
              ? t("goatCraft.stats.notConfigured")
              : t("goatCraft.stats.unavailable")
          }}
        </p>
      </div>
    </section>

    <div class="border-t border-base-content/10" />

    <!-- About -->
    <section class="container mx-auto px-4 py-12">
      <div class="mb-8 max-w-2xl">
        <h2 class="text-2xl font-bold sm:text-3xl">
          {{ t("goatCraft.about.title") }}
        </h2>
        <p class="mt-2 text-sm leading-relaxed opacity-70 sm:text-base">
          {{ t("goatCraft.about.desc") }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          v-for="card in aboutCards"
          :key="card.titleKey"
          class="rounded-lg border border-base-content/10 bg-base-200 p-5"
        >
          <component :is="card.icon" class="mb-3 h-5 w-5 text-primary" />
          <h3 class="mb-1.5 font-semibold">{{ t(card.titleKey) }}</h3>
          <p class="text-sm leading-relaxed opacity-70">{{ t(card.descKey) }}</p>
        </div>
      </div>
    </section>

    <div class="border-t border-base-content/10" />

    <!-- Features -->
    <section class="container mx-auto px-4 py-12">
      <div class="mb-8 max-w-2xl">
        <h2 class="text-2xl font-bold sm:text-3xl">
          {{ t("goatCraft.features.title") }}
        </h2>
        <p class="mt-2 text-sm leading-relaxed opacity-70 sm:text-base">
          {{ t("goatCraft.features.desc") }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="feature in features"
          :key="feature.key"
          class="rounded-lg border border-base-content/10 bg-base-200 p-4"
        >
          <component :is="feature.icon" class="mb-3 h-4 w-4 text-primary" />
          <h3 class="mb-1 text-sm font-semibold">
            {{ t(feature.titleKey) }}
          </h3>
          <p class="text-xs leading-relaxed opacity-60 sm:text-sm">
            {{ t(feature.descKey) }}
          </p>
        </div>
      </div>

      <div
        class="mt-10 rounded-lg border border-base-content/10 bg-base-200 p-5 sm:p-6"
      >
        <div class="mb-5 max-w-2xl">
          <h3 class="text-lg font-bold sm:text-xl">
            {{ t("goatCraft.solar.title") }}
          </h3>
          <p class="mt-1.5 text-sm leading-relaxed opacity-70">
            {{ t("goatCraft.solar.desc") }}
          </p>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            v-for="item in solarLinks"
            :key="item.key"
            class="border-t border-base-content/10 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-4 md:first:border-l-0 md:first:pl-0"
          >
            <component :is="item.icon" class="mb-2 h-4 w-4 text-primary" />
            <h4 class="mb-1 text-sm font-semibold">
              {{ t(item.titleKey) }}
            </h4>
            <p class="text-sm leading-relaxed opacity-65">
              {{ t(item.descKey) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="border-t border-base-content/10" />

    <!-- How to join + auth -->
    <section id="join" class="container mx-auto scroll-mt-24 px-4 py-12">
      <div class="mb-8 max-w-2xl">
        <h2 class="text-2xl font-bold sm:text-3xl">
          {{ t("goatCraft.howToJoin.title") }}
        </h2>
        <p class="mt-2 text-sm leading-relaxed opacity-70 sm:text-base">
          {{ t("goatCraft.howToJoin.desc") }}
        </p>
      </div>

      <!--
        Mobile: stacked — steps on top, methods below
        Desktop (lg+): two columns — steps left, methods right
      -->
      <div
        class="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]"
      >
        <!-- Steps -->
        <div class="flex min-w-0 flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-3 lg:flex lg:flex-col lg:gap-3">
          <div
            v-for="step in joinSteps"
            :key="step.step"
            class="flex gap-3 rounded-lg border border-base-content/10 bg-base-200 p-3 sm:p-4"
          >
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-content"
            >
              {{ step.step }}
            </span>
            <div class="min-w-0">
              <h3 class="text-sm font-semibold">
                {{ t(step.titleKey) }}
              </h3>
              <p class="mt-1 text-xs leading-relaxed opacity-60 sm:text-sm">
                {{ t(step.descKey) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Methods -->
        <div
          id="auth"
          class="min-w-0 scroll-mt-24 overflow-hidden rounded-lg border border-base-content/10 bg-base-200"
        >
          <div class="border-b border-base-content/10 px-4 py-4 sm:px-5 sm:py-5">
            <h3 class="text-base font-bold sm:text-lg">
              {{ t("goatCraft.auth.title") }}
            </h3>
            <p class="mt-1 text-sm opacity-60">
              {{ t("goatCraft.auth.desc") }}
            </p>
          </div>

          <div
            role="tablist"
            class="grid grid-cols-3 border-b border-base-content/10"
          >
            <button
              v-for="tab in authTabs"
              :key="tab.id"
              type="button"
              role="tab"
              class="relative flex min-w-0 items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:text-sm"
              :class="
                authTab === tab.id
                  ? 'bg-base-100 text-primary'
                  : 'opacity-55 hover:bg-base-100/50 hover:opacity-90'
              "
              :aria-selected="authTab === tab.id"
              @click="authTab = tab.id"
            >
              <component :is="tab.icon" class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ t(tab.labelKey) }}</span>
              <span
                v-if="authTab === tab.id"
                class="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
              />
            </button>
          </div>

          <div class="p-4 sm:p-5" role="tabpanel">
            <!-- Microsoft (Java) -->
            <div v-if="authTab === 'microsoft'" class="space-y-4">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded bg-success/15 px-2 py-0.5 text-xs font-medium text-success"
                >
                  {{ t("goatCraft.auth.microsoft.badge") }}
                </span>
                <h4 class="font-semibold">
                  {{ t("goatCraft.auth.microsoft.title") }}
                </h4>
              </div>
              <p class="text-sm leading-relaxed opacity-70">
                {{ t("goatCraft.auth.microsoft.desc") }}
              </p>
              <ol class="grid gap-2 sm:grid-cols-3 sm:gap-3">
                <li
                  v-for="n in 3"
                  :key="n"
                  class="flex gap-3 rounded-md border border-base-content/10 bg-base-100 p-3 text-sm"
                >
                  <span
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-base-200 text-xs font-bold"
                  >
                    {{ n }}
                  </span>
                  <span class="leading-relaxed opacity-80">
                    {{ t(`goatCraft.auth.microsoft.steps.${n}`) }}
                  </span>
                </li>
              </ol>
            </div>

            <!-- Solarpass (Java only) -->
            <div v-else-if="authTab === 'solarpass'" class="space-y-4">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {{ t("goatCraft.auth.solarpass.badge") }}
                </span>
                <h4 class="font-semibold">
                  {{ t("goatCraft.auth.solarpass.title") }}
                </h4>
              </div>
              <p class="text-sm leading-relaxed opacity-70">
                {{ t("goatCraft.auth.solarpass.desc") }}
              </p>
              <ol class="grid gap-2 sm:grid-cols-3 sm:gap-3">
                <li
                  v-for="n in 3"
                  :key="n"
                  class="flex gap-3 rounded-md border border-base-content/10 bg-base-100 p-3 text-sm"
                >
                  <span
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-base-200 text-xs font-bold"
                  >
                    {{ n }}
                  </span>
                  <span class="leading-relaxed opacity-80">
                    {{ t(`goatCraft.auth.solarpass.steps.${n}`) }}
                  </span>
                </li>
              </ol>
              <div
                class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <p class="text-xs opacity-50">
                  {{ t("goatCraft.auth.solarpass.hint") }}
                </p>
                <a
                  :href="AUTH_MC_URL"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-primary btn-sm gap-2 shrink-0"
                >
                  <ExternalLink class="h-4 w-4" />
                  {{ t("goatCraft.auth.solarpass.cta") }}
                </a>
              </div>
            </div>

            <!-- Bedrock -->
            <div v-else class="space-y-4">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary"
                >
                  {{ t("goatCraft.auth.bedrock.badge") }}
                </span>
                <h4 class="font-semibold">
                  {{ t("goatCraft.auth.bedrock.title") }}
                </h4>
              </div>
              <p class="text-sm leading-relaxed opacity-70">
                {{ t("goatCraft.auth.bedrock.desc") }}
              </p>
              <div
                class="rounded-md border border-warning/25 bg-warning/10 px-3 py-2.5 text-sm"
              >
                {{ t("goatCraft.auth.bedrock.note") }}
              </div>
              <ol class="grid gap-2 sm:grid-cols-3 sm:gap-3">
                <li
                  v-for="n in 3"
                  :key="n"
                  class="flex gap-3 rounded-md border border-base-content/10 bg-base-100 p-3 text-sm"
                >
                  <span
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-base-200 text-xs font-bold"
                  >
                    {{ n }}
                  </span>
                  <span class="leading-relaxed opacity-80">
                    {{ t(`goatCraft.auth.bedrock.steps.${n}`) }}
                  </span>
                </li>
              </ol>
            </div>
          </div>

          <div
            class="flex flex-col gap-3 border-t border-base-content/10 bg-base-100/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div class="min-w-0">
              <p class="text-xs opacity-50">
                {{
                  authTab === "bedrock"
                    ? t("goatCraft.editionBedrock")
                    : t("goatCraft.editionJava")
                }}
              </p>
              <p
                class="truncate font-mono text-xl font-bold tracking-wide text-primary sm:text-2xl"
              >
                {{ activeServerAddress }}
              </p>
            </div>
            <button
              type="button"
              class="btn btn-primary gap-2 shrink-0"
              @click="copyAddress(activeServerAddress)"
            >
              <Check v-if="copied" class="h-4 w-4" />
              <Copy v-else class="h-4 w-4" />
              {{ copied ? t("goatCraft.copied") : t("goatCraft.copyAddress") }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="border-t border-base-content/10" />

    <!-- History timeline + gallery -->
    <section id="history" class="container mx-auto scroll-mt-24 px-4 py-12">
      <div class="mb-8 max-w-2xl">
        <h2 class="text-2xl font-bold sm:text-3xl">
          {{ t("goatCraft.history.title") }}
        </h2>
        <p class="mt-2 text-sm leading-relaxed opacity-70 sm:text-base">
          {{ t("goatCraft.history.desc") }}
        </p>
      </div>

      <!-- Period jump chips (handy when the strip scrolls horizontally) -->
      <div class="mb-6 flex flex-wrap gap-2 lg:mb-8">
        <a
          v-for="period in timelinePeriods"
          :key="`nav-${period.id}`"
          :href="`#period-${period.id}`"
          class="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            period.status === 'current'
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-base-content/10 bg-base-200 opacity-80 hover:opacity-100'
          "
          @click="selectPeriod(period.id)"
        >
          {{ t(`goatCraft.periods.${period.id}.title`) }}
          <span v-if="period.imageCount > 0" class="opacity-60">
            · {{ period.imageCount }}
          </span>
        </a>
      </div>

      <!--
        Timeline layout:
        - < lg: vertical rail (stacked cards)
        - lg+: horizontal scroll strip
      -->
      <div class="relative mx-auto max-w-3xl lg:max-w-none">
        <!-- Vertical rail (mobile / tablet) -->
        <div
          class="absolute bottom-3 left-[0.95rem] top-3 w-px bg-base-content/10 lg:hidden"
          aria-hidden="true"
        />

        <div class="relative lg:overflow-x-auto lg:pb-2">
          <!-- Horizontal rail (large screens) -->
          <div
            class="pointer-events-none absolute left-0 right-0 top-3 hidden h-px bg-base-content/10 lg:block"
            aria-hidden="true"
          />

          <ol
            class="relative space-y-8 lg:flex lg:w-max lg:min-w-full lg:gap-6 lg:space-y-0 lg:pt-8"
          >
            <li
              v-for="period in timelinePeriods"
              :key="period.id"
              :id="`period-${period.id}`"
              class="relative grid scroll-mt-24 grid-cols-[2rem_1fr] items-start gap-x-4 lg:grid-cols-1 lg:w-[min(82vw,28rem)] lg:shrink-0 lg:gap-x-0"
              @pointerdown="selectPeriod(period.id)"
            >
              <!-- Dot: left rail on small screens, on top of horizontal rail on lg -->
              <div
                class="relative z-10 flex justify-center pt-5 lg:absolute lg:-top-7 lg:left-5 lg:pt-0"
              >
                <span
                  class="h-3.5 w-3.5 rounded-full border-2 border-base-100"
                  :class="
                    period.status === 'current'
                      ? 'bg-primary ring-4 ring-primary/20'
                      : activePeriodId === period.id
                        ? 'bg-primary/70 ring-4 ring-primary/10'
                        : 'bg-base-content/30'
                  "
                />
              </div>

              <article
                class="overflow-hidden rounded-lg border border-base-content/10 bg-base-200"
                :class="
                  period.status === 'current'
                    ? 'border-primary/30'
                    : activePeriodId === period.id
                      ? 'border-primary/20'
                      : ''
                "
              >
                <div class="p-4 sm:p-5">
                  <div class="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      class="rounded px-2 py-0.5 text-xs font-medium"
                      :class="
                        period.status === 'current'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-base-100 opacity-70'
                      "
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
                      <Images class="h-3.5 w-3.5" />
                      {{
                        t("goatCraft.gallery.count", {
                          count: period.imageCount,
                        })
                      }}
                    </span>
                  </div>
                  <h3 class="text-lg font-bold">
                    {{ t(`goatCraft.periods.${period.id}.title`) }}
                  </h3>
                  <p class="mb-1.5 text-xs opacity-50">
                    {{ t(`goatCraft.periods.${period.id}.subtitle`) }}
                  </p>
                  <p class="text-sm leading-relaxed opacity-70">
                    {{ t(`goatCraft.periods.${period.id}.desc`) }}
                  </p>
                </div>

                <!-- Per-period carousel — native <img> (no IPX) for multi-dot filenames -->
                <div
                  v-if="period.images.length > 0"
                  class="space-y-3 border-t border-base-content/10 bg-base-300/25 p-3 sm:p-4"
                >
                  <div
                    class="relative aspect-video overflow-hidden rounded-md bg-base-300"
                  >
                    <img
                      v-if="slideSrc(period.id)"
                      :key="slideSrc(period.id)!"
                      :src="slideSrc(period.id)!"
                      class="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      :alt="t(`goatCraft.periods.${period.id}.title`)"
                      @error="onGalleryImageError(slideSrc(period.id)!)"
                    />

                    <div
                      class="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-3 py-2"
                    >
                      <p class="text-xs tabular-nums text-white/90">
                        {{
                          t("goatCraft.gallery.slide", {
                            current: slideIndex(period.id) + 1,
                            total: period.images.length,
                          })
                        }}
                      </p>
                    </div>

                    <template v-if="period.images.length > 1">
                      <button
                        type="button"
                        class="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2 border-0 bg-base-100/90 shadow"
                        :aria-label="t('goatCraft.gallery.prev')"
                        @click.stop="carouselPrev(period.id)"
                      >
                        <ChevronLeft class="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        class="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2 border-0 bg-base-100/90 shadow"
                        :aria-label="t('goatCraft.gallery.next')"
                        @click.stop="carouselNext(period.id)"
                      >
                        <ChevronRight class="h-4 w-4" />
                      </button>
                    </template>
                  </div>

                  <div
                    v-if="period.images.length > 1"
                    class="flex flex-wrap justify-center gap-1.5 px-1"
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
                    v-if="period.images.length > 1"
                    :ref="(el) => bindThumbStrip(period.id, el)"
                    class="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth pb-0.5"
                  >
                    <button
                      v-for="(src, i) in period.images"
                      :key="src"
                      type="button"
                      class="relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded border-2 transition-opacity sm:w-20"
                      :class="
                        i === slideIndex(period.id)
                          ? 'border-primary opacity-100'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      "
                      @click.stop="goToSlide(period.id, i)"
                    >
                      <img
                        :src="src"
                        class="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="120"
                        height="90"
                        :alt="
                          t('goatCraft.gallery.slide', {
                            current: i + 1,
                            total: period.images.length,
                          })
                        "
                        @error="onGalleryImageError(src)"
                      />
                    </button>
                  </div>
                </div>

                <div
                  v-else
                  class="border-t border-base-content/10 px-5 py-8 text-center"
                >
                  <Images class="mx-auto mb-2 h-8 w-8 opacity-30" />
                  <p class="text-sm opacity-50">
                    {{ t("goatCraft.gallery.empty") }}
                  </p>
                </div>
              </article>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <div class="border-t border-base-content/10" />

    <!-- Reviews -->
    <section class="container mx-auto px-4 py-12">
      <div class="mb-8 max-w-2xl">
        <h2 class="text-2xl font-bold sm:text-3xl">{{ t("reviews.title") }}</h2>
        <p class="mt-2 text-sm leading-relaxed opacity-70 sm:text-base">
          {{ t("reviews.shareExperience") }}
        </p>
      </div>

      <div
        class="grid items-start gap-6 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] lg:gap-8"
      >
        <aside
          class="rounded-lg border border-base-content/10 bg-base-200 p-5 lg:sticky lg:top-24"
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
            <div class="mx-auto h-10 w-16 rounded bg-base-300" />
            <div class="h-3 w-full rounded bg-base-300" />
            <div class="h-3 w-full rounded bg-base-300" />
            <div class="h-3 w-4/5 rounded bg-base-300" />
          </div>
          <div v-else class="py-2 text-center">
            <p class="mb-1 text-3xl font-bold tabular-nums">&mdash;</p>
            <p class="text-xs opacity-50">
              {{ t("reviews.summary.count", { count: 0 }) }}
            </p>
          </div>

          <div class="divider my-4" />

          <div v-if="myReview && !myReviewLoading" class="mb-4">
            <p class="mb-2 text-xs opacity-50">{{ t("reviews.editReview") }}</p>
            <div
              class="flex items-center gap-2 rounded-md border border-base-content/10 bg-base-100 px-3 py-2"
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
                  <Star class="h-4 w-4" />
                  {{ t("reviews.writeReview") }}
                </button>
                <button
                  v-else
                  type="button"
                  class="btn btn-outline w-full gap-2"
                  @click="openReviewForm"
                >
                  <Star class="h-4 w-4" />
                  {{ t("reviews.editReview") }}
                </button>
              </template>
            </ReviewForm>
          </div>
          <div v-else class="h-10 animate-pulse rounded-md bg-base-300" />
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

    <div class="border-t border-base-content/10" />

    <!-- Help -->
    <section class="container mx-auto px-4 py-12">
      <div
        class="flex flex-col items-start justify-between gap-4 rounded-lg border border-base-content/10 bg-base-200 p-5 sm:flex-row sm:items-center sm:p-6"
      >
        <div>
          <h2 class="text-xl font-bold sm:text-2xl">
            {{ t("goatCraft.help.title") }}
          </h2>
          <p class="mt-1 text-sm opacity-70 sm:text-base">
            {{ t("goatCraft.help.desc") }}
          </p>
        </div>
        <a
          href="mailto:lily@solsynth.dev"
          class="btn btn-outline gap-2 shrink-0"
        >
          <Bug class="h-4 w-4" />
          lily@solsynth.dev
        </a>
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

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
