<script setup lang="ts">
import {
  Activity,
  BadgeCheck,
  Bug,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  HardDrive,
  Images,
  KeyRound,
  MessageSquare,
  Pickaxe,
  Play,
  Shield,
  Star,
  Users,
  Wallet,
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

/** Which address the copy button last copied (empty when idle). */
const copiedAddress = ref("");
let copiedTimer: ReturnType<typeof setTimeout> | null = null;
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
    titleKey: "goatCraft.howToJoin.step1.title",
    descKey: "goatCraft.howToJoin.step1.desc",
  },
  {
    step: 2,
    titleKey: "goatCraft.howToJoin.step2.title",
    descKey: "goatCraft.howToJoin.step2.desc",
  },
  {
    step: 3,
    titleKey: "goatCraft.howToJoin.step3.title",
    descKey: "goatCraft.howToJoin.step3.desc",
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
  if (copiedTimer) {
    clearTimeout(copiedTimer);
    copiedTimer = null;
  }
});

async function copyAddress(address: string) {
  try {
    await navigator.clipboard.writeText(address);
    copiedAddress.value = address;
    if (copiedTimer) clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      copiedAddress.value = "";
      copiedTimer = null;
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
  <div>
    <!-- Photographic masthead: the photo runs under the header and fades into
         the page colour, so the title still lands on the shell gutter. -->
    <header class="masthead">
      <div class="masthead-media" aria-hidden="true">
        <NuxtImg
          src="/images/goatcraft/main-visual.png"
          alt=""
          width="1920"
          height="1080"
          format="webp"
          loading="eager"
          fetchpriority="high"
          style="view-transition-name: product-hero-goatcraft"
        />
      </div>

      <div class="shell masthead-grid">
        <div class="masthead-copy">
          <div class="ident">
            <NuxtImg
              src="/images/goatcraft/icon.png"
              class="ident-mark"
              alt=""
              width="56"
              height="56"
              format="webp"
              loading="eager"
              decoding="async"
            />
            <span v-if="statsAvailable" class="ident-status">
              <span
                class="dot ident-dot"
                :class="{ 'is-online': (stats?.onlineCount ?? 0) > 0 }"
              />
              {{
                t("goatCraft.stats.onlineCount", {
                  count: stats?.onlineCount ?? 0,
                })
              }}
            </span>
            <span v-else class="ident-status">{{ t("goatCraft.badge") }}</span>
          </div>

          <h1 class="display masthead-title">
            GoatCraft
          </h1>
          <p class="masthead-lede">
            {{ t("goatCraft.tagline") }}
          </p>

          <div class="masthead-actions">
            <a href="#join" class="btn btn-primary action">
              <Play class="action-icon" aria-hidden="true" />
              {{ t("goatCraft.join") }}
            </a>
            <a href="#history" class="btn btn-ghost action">
              <Images class="action-icon" aria-hidden="true" />
              {{ t("goatCraft.history.title") }}
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Live server stats -->
    <section id="status" class="band">
      <div class="shell">
        <div class="band-head band-head-row">
          <div>
            <h2 class="band-title">
              {{ t("goatCraft.stats.title") }}
            </h2>
            <p class="band-lede">
              {{ t("goatCraft.stats.desc") }}
            </p>
          </div>
          <NuxtLink
            to="/products/goatcraft/stats"
            class="btn btn-sm btn-ghost gap-2"
          >
            <Activity class="action-icon" aria-hidden="true" />
            {{ t("goatCraft.stats.viewDetails") }}
          </NuxtLink>
        </div>

        <template v-if="statsAvailable && stats">
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
              <dd class="readout-figure is-capitalized">
                {{ stats.websocketState || "—" }}
              </dd>
            </div>
          </dl>

          <div class="players">
            <div class="players-head">
              <h3 class="players-title">
                {{ t("goatCraft.stats.playersOnline") }}
              </h3>
              <p class="players-meta">
                <span v-if="stats.metricsEnabled !== null">
                  {{ t("goatCraft.stats.metrics") }}
                  {{
                    stats.metricsEnabled
                      ? t("goatCraft.stats.metricsOn")
                      : t("goatCraft.stats.metricsOff")
                  }}
                </span>
                <span v-if="stats.apiUptimeMs != null">
                  · {{ t("goatCraft.stats.apiUptime") }}
                  {{ formatDuration(stats.apiUptimeMs) }}
                </span>
                <span v-if="statsUpdatedLabel">
                  · {{ t("goatCraft.stats.updatedAt", { time: statsUpdatedLabel }) }}
                </span>
                <span v-if="statsStatus === 'pending'">
                  · {{ t("goatCraft.stats.refreshing") }}
                </span>
              </p>
            </div>

            <ul v-if="stats.onlinePlayers.length" class="player-list">
              <li
                v-for="player in stats.onlinePlayers"
                :key="player.uuid || player.name"
                class="player"
              >
                <span class="dot" />
                {{ player.name }}
              </li>
            </ul>
            <p v-else class="players-empty">
              {{ t("goatCraft.stats.noPlayers") }}
            </p>
          </div>
        </template>

        <p v-else class="stats-empty">
          {{
            statsPayload?.reason === "not_configured"
              ? t("goatCraft.stats.notConfigured")
              : t("goatCraft.stats.unavailable")
          }}
        </p>
      </div>
    </section>

    <!-- About -->
    <section class="band band-divided">
      <div class="shell">
        <div class="band-head">
          <h2 class="band-title">
            {{ t("goatCraft.about.title") }}
          </h2>
          <p class="band-lede">
            {{ t("goatCraft.about.desc") }}
          </p>
        </div>

        <ul class="about-grid">
          <li v-for="card in aboutCards" :key="card.titleKey" class="about-cell">
            <component :is="card.icon" class="about-icon" aria-hidden="true" />
            <h3 class="about-title">
              {{ t(card.titleKey) }}
            </h3>
            <p class="about-desc">
              {{ t(card.descKey) }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <!-- Features -->
    <section class="band band-divided">
      <div class="shell">
        <div class="band-head">
          <h2 class="band-title">
            {{ t("goatCraft.features.title") }}
          </h2>
          <p class="band-lede">
            {{ t("goatCraft.features.desc") }}
          </p>
        </div>

        <ul class="feature-list">
          <li v-for="feature in features" :key="feature.key" class="feature-item">
            <component
              :is="feature.icon"
              class="feature-icon"
              aria-hidden="true"
            />
            <div>
              <h3 class="feature-title">
                {{ t(feature.titleKey) }}
              </h3>
              <p class="feature-desc">
                {{ t(feature.descKey) }}
              </p>
            </div>
          </li>
        </ul>

        <div class="plate solar">
          <div class="solar-head">
            <h3 class="solar-title">
              {{ t("goatCraft.solar.title") }}
            </h3>
            <p class="solar-desc">
              {{ t("goatCraft.solar.desc") }}
            </p>
          </div>
          <ul class="solar-list">
            <li v-for="item in solarLinks" :key="item.key">
              <component :is="item.icon" class="solar-icon" aria-hidden="true" />
              <h4 class="solar-item-title">
                {{ t(item.titleKey) }}
              </h4>
              <p class="solar-item-desc">
                {{ t(item.descKey) }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- How to join -->
    <section id="join" class="band band-divided">
      <div class="shell">
        <div class="band-head">
          <h2 class="band-title">
            {{ t("goatCraft.howToJoin.title") }}
          </h2>
          <p class="band-lede">
            {{ t("goatCraft.howToJoin.desc") }}
          </p>
        </div>

        <!-- Genuinely a sequence: sign in, configure the launcher, then join. -->
        <ol class="join-steps">
          <li v-for="step in joinSteps" :key="step.step" class="join-step">
            <span class="step-number">{{ step.step }}</span>
            <div class="step-body">
              <h3 class="step-title">
                {{ t(step.titleKey) }}
              </h3>
              <p class="step-desc">
                {{ t(step.descKey) }}
              </p>
            </div>
          </li>
        </ol>

        <ul id="auth" class="methods scroll-mt-24">
          <!-- Microsoft (Java) -->
          <li class="plate method">
            <div class="method-head">
              <h3 class="method-title">
                {{ t("goatCraft.auth.microsoft.title") }}
              </h3>
              <span class="chip">{{ t("goatCraft.auth.microsoft.badge") }}</span>
            </div>
            <p class="method-desc">
              {{ t("goatCraft.auth.microsoft.desc") }}
            </p>
            <div class="method-address">
              <div>
                <span class="field-label">{{ t("goatCraft.editionJava") }}</span>
                <p class="method-host">
                  {{ SERVER_ADDRESS }}
                </p>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-ghost method-copy gap-2"
                @click="copyAddress(SERVER_ADDRESS)"
              >
                <Check
                  v-if="copiedAddress === SERVER_ADDRESS"
                  class="action-icon"
                  aria-hidden="true"
                />
                <Copy v-else class="action-icon" aria-hidden="true" />
                {{
                  copiedAddress === SERVER_ADDRESS
                    ? t("goatCraft.copied")
                    : t("goatCraft.copyAddress")
                }}
              </button>
            </div>
            <ol class="method-steps">
              <li v-for="n in 3" :key="n" class="method-step">
                <span class="method-step-number">{{ n }}</span>
                <span>{{ t(`goatCraft.auth.microsoft.steps.${n}`) }}</span>
              </li>
            </ol>
          </li>

          <!-- Solarpass (Java only) -->
          <li class="plate method">
            <div class="method-head">
              <h3 class="method-title">
                {{ t("goatCraft.auth.solarpass.title") }}
              </h3>
              <span class="chip">{{ t("goatCraft.auth.solarpass.badge") }}</span>
            </div>
            <p class="method-desc">
              {{ t("goatCraft.auth.solarpass.desc") }}
            </p>
            <div class="method-address">
              <div>
                <span class="field-label">{{ t("goatCraft.editionJava") }}</span>
                <p class="method-host">
                  {{ SERVER_ADDRESS }}
                </p>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-ghost method-copy gap-2"
                @click="copyAddress(SERVER_ADDRESS)"
              >
                <Check
                  v-if="copiedAddress === SERVER_ADDRESS"
                  class="action-icon"
                  aria-hidden="true"
                />
                <Copy v-else class="action-icon" aria-hidden="true" />
                {{
                  copiedAddress === SERVER_ADDRESS
                    ? t("goatCraft.copied")
                    : t("goatCraft.copyAddress")
                }}
              </button>
            </div>
            <ol class="method-steps">
              <li v-for="n in 3" :key="n" class="method-step">
                <span class="method-step-number">{{ n }}</span>
                <span>{{ t(`goatCraft.auth.solarpass.steps.${n}`) }}</span>
              </li>
            </ol>
            <div class="method-actions">
              <a
                :href="AUTH_MC_URL"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-sm btn-ghost gap-2"
              >
                <ExternalLink class="action-icon" aria-hidden="true" />
                {{ t("goatCraft.auth.solarpass.cta") }}
              </a>
            </div>
            <p class="method-hint">
              {{ t("goatCraft.auth.solarpass.hint") }}
            </p>
          </li>

          <!-- Bedrock -->
          <li class="plate method">
            <div class="method-head">
              <h3 class="method-title">
                {{ t("goatCraft.auth.bedrock.title") }}
              </h3>
              <span class="chip">{{ t("goatCraft.auth.bedrock.badge") }}</span>
            </div>
            <p class="method-desc">
              {{ t("goatCraft.auth.bedrock.desc") }}
            </p>
            <div class="method-address">
              <div>
                <span class="field-label">{{ t("goatCraft.editionBedrock") }}</span>
                <p class="method-host">
                  {{ BEDROCK_SERVER_ADDRESS }}
                </p>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-ghost method-copy gap-2"
                @click="copyAddress(BEDROCK_SERVER_ADDRESS)"
              >
                <Check
                  v-if="copiedAddress === BEDROCK_SERVER_ADDRESS"
                  class="action-icon"
                  aria-hidden="true"
                />
                <Copy v-else class="action-icon" aria-hidden="true" />
                {{
                  copiedAddress === BEDROCK_SERVER_ADDRESS
                    ? t("goatCraft.copied")
                    : t("goatCraft.copyAddress")
                }}
              </button>
            </div>
            <ol class="method-steps">
              <li v-for="n in 3" :key="n" class="method-step">
                <span class="method-step-number">{{ n }}</span>
                <span>{{ t(`goatCraft.auth.bedrock.steps.${n}`) }}</span>
              </li>
            </ol>
            <p class="method-note note note-warning">
              {{ t("goatCraft.auth.bedrock.note") }}
            </p>
          </li>
        </ul>
      </div>
    </section>


    <!-- History timeline + gallery -->
    <section id="history" class="band band-divided">
      <div class="shell">
        <div class="band-head">
          <h2 class="band-title">
            {{ t("goatCraft.history.title") }}
          </h2>
          <p class="band-lede">
            {{ t("goatCraft.history.desc") }}
          </p>
        </div>

        <!-- Period jump chips (handy when the strip scrolls horizontally) -->
        <div class="timeline-nav">
          <a
            v-for="period in timelinePeriods"
            :key="`nav-${period.id}`"
            :href="`#period-${period.id}`"
            class="chip"
            :class="{
              'is-current': period.status === 'current',
            }"
            @click="selectPeriod(period.id)"
          >
            {{ t(`goatCraft.periods.${period.id}.title`) }}
            <span v-if="period.imageCount > 0" class="chip-count">
              {{ period.imageCount }}
            </span>
          </a>
        </div>

        <!--
          One rail, two layouts: a vertical rail below lg, a horizontal strip
          above it. The periods are the same list either way.
        -->
        <div class="timeline">
          <div class="rail-vertical" aria-hidden="true" />

          <div class="timeline-track">
            <div class="rail-horizontal" aria-hidden="true" />

            <ol class="period-list">
              <li
                v-for="period in timelinePeriods"
                :id="`period-${period.id}`"
                :key="period.id"
                class="period-row"
                @pointerdown="selectPeriod(period.id)"
              >
                <div class="rail-cell" aria-hidden="true">
                  <span
                    class="rail-dot"
                    :class="{
                      'is-current': period.status === 'current',
                      'is-active':
                        period.status !== 'current' &&
                        activePeriodId === period.id,
                    }"
                  />
                </div>

                <article class="period">
                  <div class="period-body">
                    <div class="period-meta">
                      <span class="chip">
                        {{ t(`goatCraft.periodStatus.${period.status}`) }}
                      </span>
                      <span class="period-date">
                        {{ t(`goatCraft.periods.${period.id}.date`) }}
                      </span>
                      <span
                        v-if="period.imageCount > 0"
                        class="period-count"
                      >
                        {{ t("goatCraft.gallery.count", { count: period.imageCount }) }}
                      </span>
                    </div>
                    <h3 class="period-title">
                      {{ t(`goatCraft.periods.${period.id}.title`) }}
                    </h3>
                    <p class="period-subtitle">
                      {{ t(`goatCraft.periods.${period.id}.subtitle`) }}
                    </p>
                    <p class="period-desc">
                      {{ t(`goatCraft.periods.${period.id}.desc`) }}
                    </p>
                  </div>

                  <!-- Per-period carousel — native <img> (no IPX) for multi-dot filenames -->
                  <div v-if="period.images.length > 0" class="period-gallery">
                    <div class="slide">
                      <img
                        v-if="slideSrc(period.id)"
                        :key="slideSrc(period.id)!"
                        :src="slideSrc(period.id)!"
                        loading="lazy"
                        decoding="async"
                        :alt="t(`goatCraft.periods.${period.id}.title`)"
                        @error="onGalleryImageError(slideSrc(period.id)!)"
                      />

                      <span class="slide-count">
                        {{
                          t("goatCraft.gallery.slide", {
                            current: slideIndex(period.id) + 1,
                            total: period.images.length,
                          })
                        }}
                      </span>

                      <template v-if="period.images.length > 1">
                        <button
                          type="button"
                          class="carousel-arrow is-prev"
                          :aria-label="t('goatCraft.gallery.prev')"
                          @click.stop="carouselPrev(period.id)"
                        >
                          <ChevronLeft class="action-icon" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          class="carousel-arrow is-next"
                          :aria-label="t('goatCraft.gallery.next')"
                          @click.stop="carouselNext(period.id)"
                        >
                          <ChevronRight class="action-icon" aria-hidden="true" />
                        </button>
                      </template>
                    </div>

                    <div
                      v-if="period.images.length > 1"
                      class="slide-dots"
                    >
                      <button
                        v-for="(_, i) in period.images"
                        :key="i"
                        type="button"
                        class="slide-dot"
                        :class="{ 'is-current': i === slideIndex(period.id) }"
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
                      class="thumbs scrollbar-hide"
                    >
                      <button
                        v-for="(src, i) in period.images"
                        :key="src"
                        type="button"
                        class="thumb"
                        :class="{ 'is-current': i === slideIndex(period.id) }"
                        @click.stop="goToSlide(period.id, i)"
                      >
                        <img
                          :src="src"
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

                  <p v-else class="gallery-empty">
                    {{ t("goatCraft.gallery.empty") }}
                  </p>
                </article>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>


    <!-- Reviews -->
    <section class="reviews">
      <div class="shell">
        <div class="reviews-head">
          <div>
            <h2 class="band-title">
              {{ t("reviews.title") }}
            </h2>
            <p class="band-lede">
              {{ t("reviews.shareExperience") }}
            </p>
          </div>

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
                v-if="!myReview && !myReviewLoading"
                type="button"
                class="btn btn-sm gap-2"
                @click="openReviewForm"
              >
                <Star class="action-icon" aria-hidden="true" />
                {{ t("reviews.writeReview") }}
              </button>
              <button
                v-else-if="!myReviewLoading"
                type="button"
                class="btn btn-sm btn-ghost gap-2"
                @click="openReviewForm"
              >
                <Star class="action-icon" aria-hidden="true" />
                {{ t("reviews.editReview") }}
              </button>
            </template>
          </ReviewForm>
        </div>

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
          class="reviews-summary"
        />
        <div
          v-else-if="reviewsLoading || myReviewLoading"
          class="reviews-summary"
        >
          <span class="skeleton summary-skeleton" />
        </div>

        <div v-if="myReview && !myReviewLoading" class="my-review">
          <span class="field-label">{{ t("reviews.editReview") }}</span>
          <span class="my-review-score">
            <StarRating :model-value="myReview.rating" size="xs" readonly />
            <span class="mono">{{ myReview.rating }}/5</span>
          </span>
        </div>

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
    </section>

    <!-- Help -->
    <section class="shell help">
      <div class="help-row">
        <div>
          <h2 class="help-title">
            {{ t("goatCraft.help.title") }}
          </h2>
          <p class="help-desc">
            {{ t("goatCraft.help.desc") }}
          </p>
        </div>
        <a href="mailto:lily@solsynth.dev" class="btn btn-sm gap-2">
          <Bug class="action-icon" aria-hidden="true" />
          lily@solsynth.dev
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.masthead {
  position: relative;
  overflow: hidden;
  margin-top: calc(-1 * var(--site-page-offset));
  padding-top: calc(var(--site-page-offset) + 4.5rem);
  padding-bottom: 3rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.masthead-media {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.masthead-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.5;
}

.masthead-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to top,
      var(--color-base-100) 10%,
      color-mix(in oklab, var(--color-base-100) 60%, transparent) 55%,
      transparent 95%
    ),
    linear-gradient(
      to right,
      var(--color-base-100) 6%,
      color-mix(in oklab, var(--color-base-100) 55%, transparent) 62%,
      transparent 100%
    );
}

.masthead-grid {
  position: relative;
  z-index: 1;
}

.masthead-copy {
  max-width: 34rem;
}

.ident {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.ident-mark {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-mark);
  object-fit: cover;
  background: var(--color-base-300);
}

.ident-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-dim);
}

.ident-dot {
  background: var(--color-base-300);
}

.ident-dot.is-online {
  background: var(--color-success);
}

.masthead-title {
  margin: 0;
  font-size: clamp(2.25rem, 5vw, 3.25rem);
}

.masthead-lede {
  margin: 1rem 0 0;
  max-width: 32rem;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--color-dim);
}

.masthead-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.75rem;
}

.action {
  padding-inline: 1.25rem;
}

.action-icon {
  width: 0.9375rem;
  height: 0.9375rem;
}

.band {
  padding-block: 3.5rem;
}

.band-divided {
  border-top: 1px solid var(--color-line-soft);
}

.band-head {
  max-width: 34rem;
  margin-bottom: 2rem;
}

.band-head-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  max-width: none;
}

.band-title {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.band-lede {
  margin: 0.6rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-dim);
}

.readout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
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
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  text-transform: none;
}

.readout-figure.is-capitalized {
  text-transform: capitalize;
}

.readout-figure.is-lead {
  color: var(--color-primary);
}

.players {
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-line-soft);
}

.players-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem 1rem;
}

.players-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.players-meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-faint);
}

.player-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 1rem;
  margin: 0.9rem 0 0;
  padding: 0;
  list-style: none;
}

.player {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.player .dot {
  background: var(--color-success);
}

.players-empty,
.stats-empty {
  margin: 0.9rem 0 0;
  font-size: 0.9375rem;
  color: var(--color-faint);
}

.stats-empty {
  margin-top: 0;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-line-soft);
}

.about-grid,
.feature-list,
.solar-list,
.join-steps,
.methods {
  margin: 0;
  padding: 0;
  list-style: none;
}

.about-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem 2.5rem;
}

.about-cell {
  padding-top: 1rem;
  border-top: 1px solid var(--color-line);
}

.about-icon {
  width: 1.0625rem;
  height: 1.0625rem;
  color: var(--color-primary);
}

.about-title {
  margin: 0.7rem 0 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.about-desc {
  margin: 0.3rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.feature-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  border-top: 1px solid var(--color-line);
}

.feature-item {
  display: grid;
  grid-template-columns: 1.25rem minmax(0, 1fr);
  gap: 0 0.85rem;
  padding-block: 1rem;
  border-bottom: 1px solid var(--color-line-soft);
}

.feature-icon {
  margin-top: 0.2rem;
  width: 0.9375rem;
  height: 0.9375rem;
  color: var(--color-primary);
}

.feature-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.feature-desc {
  margin: 0.15rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
}

.solar {
  margin-top: 2.5rem;
  padding: 1.5rem;
}

.solar-head {
  max-width: 32rem;
}

.solar-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
}

.solar-desc {
  margin: 0.5rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-dim);
}

.solar-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.solar-item-title {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.solar-item-desc {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--color-faint);
}

.solar-icon {
  width: 0.9375rem;
  height: 0.9375rem;
  color: var(--color-primary);
}

.join-steps {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.join-step {
  display: flex;
  gap: 0.75rem;
}

.step-number {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  padding-top: 0.15rem;
}

.step-body {
  min-width: 0;
}

.step-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.step-desc {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.methods {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

.method {
  padding: 1.35rem;
}

.method-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.method-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.method-desc {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-dim);
}

.method-address {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-top: 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--color-line-soft);
}

.method-host {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  word-break: break-all;
}

.method-copy {
  flex-shrink: 0;
}

.method-steps {
  display: grid;
  gap: 0.5rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.method-step {
  display: flex;
  gap: 0.7rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-dim);
}

.method-step-number {
  flex-shrink: 0;
  padding-top: 0.1rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-faint);
}

.method-note {
  margin: 1rem 0 0;
}

.method-hint {
  margin: 1rem 0 0;
  font-size: 0.75rem;
  line-height: 1.55;
  color: var(--color-faint);
}

.method-actions {
  margin-top: 1rem;
}

.chip-count {
  color: var(--color-faint);
}

.timeline-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}

.timeline {
  position: relative;
}

.rail-vertical {
  position: absolute;
  left: 0.95rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 1px;
  background: var(--color-line);
}

.rail-horizontal {
  display: none;
}

.timeline-track {
  position: relative;
}

.period-list {
  position: relative;
  display: grid;
  gap: 2rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.period-row {
  position: relative;
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  align-items: start;
  gap: 0 1rem;
  scroll-margin-top: 6rem;
}

.rail-cell {
  display: flex;
  justify-content: center;
  padding-top: 1.15rem;
}

.rail-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: color-mix(in oklab, var(--color-primary) 40%, var(--color-base-100));
}

.rail-dot.is-current,
.rail-dot.is-active {
  background: var(--color-primary);
}

.period {
  overflow: hidden;
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-card);
  background: var(--color-base-200);
}

.period-body {
  padding: 1.1rem 1.25rem 1.35rem;
}

.period-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.75rem;
  margin-bottom: 0.7rem;
}

.period-date,
.period-count {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-faint);
}

.period-count {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.period-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
}

.period-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-faint);
}

.period-desc {
  margin: 0.6rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-dim);
}

.period-gallery {
  padding: 0.9rem;
  border-top: 1px solid var(--color-line-soft);
}

.slide {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-chip);
  border: 1px solid var(--color-line-soft);
  background: var(--color-base-300);
  aspect-ratio: 16 / 9;
}

.slide img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-count {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-chip);
  border: 1px solid var(--color-line-soft);
  background: color-mix(in oklab, var(--color-base-100) 88%, transparent);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-dim);
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  background: color-mix(in oklab, var(--color-base-100) 88%, transparent);
  color: var(--color-base-content);
  transition: background-color 140ms ease;
}

.carousel-arrow:hover {
  background: var(--color-base-100);
}

.carousel-arrow.is-prev {
  left: 0.5rem;
}

.carousel-arrow.is-next {
  right: 0.5rem;
}

.slide-dots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 0.7rem;
}

.slide-dot {
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 999px;
  background: var(--color-line);
}

.slide-dot.is-current {
  width: 1rem;
  background: var(--color-primary);
}

.thumbs {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.7rem;
  overflow-x: auto;
  scroll-behavior: smooth;
}

.thumb {
  position: relative;
  width: 3.5rem;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-chip);
  border: 1px solid var(--color-line-soft);
  aspect-ratio: 4 / 3;
}

.thumb.is-current {
  border-color: var(--color-primary);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-empty {
  padding: 2rem 1rem;
  border-top: 1px solid var(--color-line-soft);
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-faint);
}

.reviews {
  padding-block: 3.5rem;
  border-top: 1px solid var(--color-line-soft);
}

.reviews-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.reviews-summary {
  margin-bottom: 1.5rem;
}

.summary-skeleton {
  height: 4.5rem;
  max-width: 30rem;
}

.my-review {
  margin-bottom: 1.25rem;
}

.my-review-score {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.help {
  padding-block: 0 3.5rem;
}

.help-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-line-soft);
}

.help-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.help-desc {
  margin: 0.35rem 0 0;
  max-width: 30rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-faint);
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

@media (min-width: 640px) {
  .about-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feature-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 2.5rem;
  }

  .solar-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .masthead {
    padding-top: calc(var(--site-page-offset) + 5.5rem);
    padding-bottom: 3.75rem;
  }

  .readout {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .about-grid,
  .feature-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .join-steps {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2rem;
  }

  .methods {
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  }

  .rail-vertical {
    display: none;
  }

  .rail-horizontal {
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: 0.78rem;
    height: 1px;
    background: var(--color-line);
  }

  .period-list {
    display: flex;
    width: max-content;
    min-width: 100%;
    gap: 1.5rem;
    padding-top: 2rem;
  }

  .timeline-track {
    overflow-x: auto;
    padding-bottom: 0.75rem;
  }

  .period-row {
    display: block;
    width: min(82vw, 27rem);
    flex-shrink: 0;
  }

  .rail-cell {
    position: absolute;
    top: -1.55rem;
    left: 1.15rem;
    padding-top: 0;
  }
}
</style>
