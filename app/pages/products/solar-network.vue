<script setup lang="ts">
import ProductDownloadSection from "~/components/ProductDownloadSection.vue";
import type { ProductDownloadPlatform } from "~/types/product-download";
import {
  CodeXml,
  ExternalLink,
  Bug,
  Folder,
  MessageSquare,
  FileText,
  Rss,
  Users,
  CreditCard,
  Globe,
  Sticker,
  Code,
  Heart,
  Sparkles,
  Zap,
  Shield,
  Monitor,
  Bell,
  Calendar,
  Wallet,
  Image,
  CheckCircle,
  SmilePlus,
  History,
  ChevronDown,
  ChevronUp,
  Star,
  BookOpen,
} from "@lucide/vue";
import IconsIconIos from "~/components/Icons/IconIos.vue";
import IconsIconAndroid from "~/components/Icons/IconAndroid.vue";
import IconsIconMacos from "~/components/Icons/IconMacos.vue";
import IconsIconLinux from "~/components/Icons/IconLinux.vue";

const { t, locale } = useI18n();

const PRODUCT_SLUG = "solar-network";
const docsUrl = computed(() =>
  locale.value === "zh"
    ? "https://kb.solsynth.dev/zh/solar-network/account/"
    : "https://kb.solsynth.dev/solar-network/account/",
);
const showAllReleases = ref(false);
const reviewFormOpen = ref(false);
const reviewForm = ref({
  rating: 0,
  title: "",
  content: "",
  isRecommended: null as boolean | null,
});


const {
  releases,
  latest,
  loading: releasesLoading,
  fetchReleases,
  fetchLatest,
} = useProductReleases(PRODUCT_SLUG);


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

onMounted(() => {
  void Promise.all([fetchLatest(), fetchMyReview(), refreshReviews()]);
});

async function toggleAllReleases() {
  showAllReleases.value = !showAllReleases.value;
  if (showAllReleases.value && releases.value.length === 0) {
    await fetchReleases();
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

// ==================== Page content data ====================

const aboutCards = [
  {
    icon: Heart,
    bg: "bg-primary/20",
    iconClass: "text-primary",
    titleKey: "solarNetwork.aboutCard.peaceful.title",
    descKey: "solarNetwork.aboutCard.peaceful.desc",
  },
  {
    icon: Code,
    bg: "bg-secondary/20",
    iconClass: "text-secondary",
    titleKey: "solarNetwork.aboutCard.developer.title",
    descKey: "solarNetwork.aboutCard.developer.desc",
  },
  {
    icon: Zap,
    bg: "bg-accent/20",
    iconClass: "text-accent",
    titleKey: "solarNetwork.aboutCard.open.title",
    descKey: "solarNetwork.aboutCard.open.desc",
  },
] as const;

const featuredFeatures = [
  {
    key: "timeline",
    icon: MessageSquare,
    image: "/images/solar-network/screenshots/explore.webp",
    alt: "Timeline",
    reverse: false,
  },
  {
    key: "chat",
    icon: MessageSquare,
    image: "/images/solar-network/screenshots/chat.webp",
    alt: "Chat",
    reverse: true,
  },
  {
    key: "realms",
    icon: Users,
    image: "/images/solar-network/screenshots/realms.webp",
    alt: "Realms",
    reverse: false,
  },
] as const;

const screenshotFeatures = [
  {
    key: "reactions",
    icon: SmilePlus,
    image: "/images/solar-network/screenshots/post-reactions.webp",
    alt: "Reactions",
  },
  {
    key: "collections",
    icon: Folder,
    image: "/images/solar-network/screenshots/post-collections.webp",
    alt: "Collections",
  },
  {
    key: "wallet",
    icon: Wallet,
    image: "/images/solar-network/screenshots/wallet.webp",
    alt: "Wallet",
  },
  {
    key: "stickers",
    icon: Sticker,
    image: "/images/solar-network/screenshots/stickers.webp",
    alt: "Stickers",
  },
  {
    key: "files",
    icon: Image,
    image: "/images/solar-network/screenshots/drive.webp",
    alt: "Drive",
  },
  {
    key: "achievements",
    icon: CheckCircle,
    image: "/images/solar-network/screenshots/badges.webp",
    alt: "Achievements",
  },
  {
    key: "polls",
    icon: Calendar,
    image: "/images/solar-network/screenshots/surveys.webp",
    alt: "Polls",
  },
  {
    key: "dashboard",
    icon: Monitor,
    image: "/images/solar-network/screenshots/dashboard.webp",
    alt: "Dashboard",
  },
  {
    key: "events",
    icon: Calendar,
    image: "/images/solar-network/screenshots/events.webp",
    alt: "Events",
  },
  {
    key: "eventCalendar",
    icon: Calendar,
    image: "/images/solar-network/screenshots/event-calendar.webp",
    alt: "Event Calendar",
  },
  {
    key: "presences",
    icon: Sparkles,
    image: "/images/solar-network/screenshots/profile-presences.webp",
    alt: "Profile Presences",
  },
  {
    key: "developerHub",
    icon: Code,
    image: "/images/solar-network/screenshots/developer-hub.webp",
    alt: "Developer Hub",
  },
] as const;

const simpleFeatures = [
  { key: "social", icon: Users },
  { key: "countdown", icon: Calendar },
  { key: "oauth", icon: Shield },
  { key: "checkin", icon: Bell },
  { key: "rss", icon: Rss },
  { key: "editor", icon: FileText },
  { key: "fediverse", icon: Globe },
  { key: "gallery", icon: Image },
  { key: "subscription", icon: CreditCard },
  { key: "more", icon: Sparkles },
] as const;


const platforms: ProductDownloadPlatform[] = [
  {
    id: "web",
    label: "Web",
    icon: Globe,
    titleKey: "solarNetwork.download.web.title",
    descKey: "solarNetwork.download.web.desc",
    actions: [
      {
        href: "https://web.solian.app",
        label: "solarNetwork.journey.openBrowser",
        i18n: true,
        variant: "primary",
        icon: ExternalLink,
      },
    ],
  },
  {
    id: "ios",
    label: "iOS",
    icon: IconsIconIos,
    iconClass: "fill-current",
    titleKey: "solarNetwork.download.ios.title",
    descKey: "solarNetwork.download.ios.desc",
    actions: [
      {
        href: "https://testflight.apple.com/join/YJ0lmN6O",
        label: "solarNetwork.download.ios.testflight",
        i18n: true,
        variant: "primary",
        icon: IconsIconIos,
        iconClass: "fill-current",
      },
    ],
  },
  {
    id: "android",
    label: "Android",
    icon: IconsIconAndroid,
    iconClass: "fill-current",
    titleKey: "solarNetwork.download.android.title",
    descKey: "solarNetwork.download.android.desc",
    actions: [
      {
        artifactPlatform: "android",
        artifactArchitecture: "arm64",
        label: "ARM64 (arm64-v8a)",
        variant: "primary",
        icon: IconsIconAndroid,
        iconClass: "fill-current",
      },
      {
        artifactPlatform: "android",
        artifactArchitecture: "armeabi-v7a",
        label: "ARMv7 (armeabi-v7a)",
        variant: "outline",
        icon: IconsIconAndroid,
        iconClass: "fill-current",
      },
      {
        artifactPlatform: "android",
        artifactArchitecture: "x86_64",
        label: "x86_64",
        variant: "outline",
        icon: IconsIconAndroid,
        iconClass: "fill-current",
      },
    ],
  },
  {
    id: "macos",
    label: "macOS",
    icon: IconsIconMacos,
    iconClass: "fill-current",
    titleKey: "solarNetwork.download.macos.title",
    descKey: "solarNetwork.download.macos.desc",
    brew: true,
    actions: [
      {
        href: "https://testflight.apple.com/join/YJ0lmN6O",
        label: "solarNetwork.download.macos.testflight",
        i18n: true,
        variant: "primary",
        icon: IconsIconMacos,
        iconClass: "fill-current",
      },
      {
        artifactPlatform: "macos",
        label: "solarNetwork.download.direct",
        i18n: true,
        variant: "outline",
        icon: ExternalLink,
      },
    ],
  },
  {
    id: "windows",
    label: "Windows",
    icon: Monitor,
    titleKey: "solarNetwork.download.windows.title",
    descKey: "solarNetwork.download.windows.desc",
    actions: [
      {
        artifactPlatform: "windows",
        label: "solarNetwork.download.direct",
        i18n: true,
        variant: "primary",
        icon: ExternalLink,
      },
    ],
  },
  {
    id: "linux",
    label: "Linux",
    icon: IconsIconLinux,
    iconClass: "fill-current",
    titleKey: "solarNetwork.download.linux.title",
    descKey: "solarNetwork.download.linux.desc",
    actions: [
      {
        artifactPlatform: "linux",
        label: "solarNetwork.download.direct",
        i18n: true,
        variant: "primary",
        icon: ExternalLink,
      },
    ],
  },
];


definePageMeta({
  title: "Solar Network",
  description: "The peaceful Social Network.",
});

useSeoMeta({
  description: () => t("solarNetwork.tagline"),
});

defineOgImage("UniOgImage", {
  title: "Solar Network",
  description: () => t("solarNetwork.tagline"),
  iconImage: "/images/solar-network/icon.png",
  backgroundImage: "/images/solar-network/main-visual-og.png",
});
</script>

<template>
  <div class="solar-network-page">
    <!-- Hero -->
    <section
      class="relative h-[70vh] min-h-120 overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <NuxtImg
        src="/images/solar-network/main-visual.webp"
        class="absolute inset-0 w-full h-full object-cover object-top-left -z-10 opacity-80"
        width="1920"
        height="1080"
        loading="eager"
        fetchpriority="high"
        format="webp"
        alt=""
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/20 to-transparent dark:via-base-100/40"
      />

      <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
        <div
          class="container mx-auto flex flex-col md:flex-row md:items-end gap-4 md:gap-6"
        >
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <NuxtImg
              src="/images/solar-network/icon.png"
              class="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-xl md:rounded-2xl shadow-2xl shrink-0"
              alt="Solar Network"
              width="112"
              height="112"
              format="webp"
              loading="eager"
              decoding="async"
            />
            <div class="min-w-0 flex-1">
              <h1 class="text-2xl sm:text-4xl md:text-5xl font-bold mb-0.5 sm:mb-2">
                Solar Network
              </h1>
              <p class="text-sm sm:text-xl opacity-90 line-clamp-2">
                {{ t("solarNetwork.tagline") }}
              </p>
            </div>
          </div>

          <div
            class="flex flex-col gap-2 w-full md:w-auto md:shrink-0 md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-3"
          >
            <!-- md:contents flattens wrappers so all buttons sit on one row on desktop -->
            <div class="grid grid-cols-2 gap-2 md:contents">
              <a
                href="https://web.solian.app"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary btn-sm sm:btn-md md:btn-lg rounded-full"
              >
                <Sparkles class="w-4 h-4 sm:w-5 sm:h-5" />
                {{ t("solarNetwork.getStarted") }}
              </a>
              <a
                href="#download"
                class="btn btn-accent btn-sm sm:btn-md md:btn-lg rounded-full"
              >
                <ExternalLink class="w-4 h-4 sm:w-5 sm:h-5" />
                {{ t("solarNetwork.download.btn") }}
              </a>
            </div>
            <div class="flex gap-2 md:contents">
              <a
                :href="docsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline btn-sm sm:btn-md md:btn-lg rounded-full flex-1 md:flex-none gap-1.5"
              >
                <BookOpen class="w-4 h-4 sm:w-5 sm:h-5" />
                {{ t("solarNetwork.docs") }}
              </a>
              <a
                href="https://github.com/Solsynth/Solian"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline btn-sm sm:btn-md md:btn-lg rounded-full flex-1 md:flex-none gap-1.5"
              >
                <CodeXml class="w-4 h-4 sm:w-5 sm:h-5" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="divider mt-0 h-px" />

    <!-- About -->
    <section class="container mx-auto px-4 pt-24 pb-16">
      <div class="text-center mb-12">
        <span class="badge badge-primary badge-outline mb-4">{{
          t("solarNetwork.about.badge")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("solarNetwork.about.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-3xl mx-auto">
          {{ t("solarNetwork.about.desc") }}
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

    <div class="section-divider" aria-hidden="true" />

    <!-- Features -->
    <section class="container mx-auto px-4 py-16">
      <div class="text-center mb-16">
        <span class="badge badge-secondary badge-outline mb-4">{{
          t("solarNetwork.features.badge")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("solarNetwork.features.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-2xl mx-auto">
          {{ t("solarNetwork.features.desc") }}
        </p>
      </div>

      <div
        v-for="feature in featuredFeatures"
        :key="feature.key"
        class="card bg-base-200 overflow-hidden mb-8"
      >
        <div class="grid md:grid-cols-2 gap-0">
          <div
            class="p-8 md:p-10 flex flex-col justify-center"
            :class="feature.reverse ? 'md:order-2 order-1' : ''"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <component
                  :is="feature.icon"
                  class="w-6 h-6 text-primary"
                />
              </div>
              <h3 class="text-2xl font-bold text-primary">
                {{ t(`solarNetwork.features.${feature.key}.title`) }}
              </h3>
            </div>
            <p class="opacity-80 leading-relaxed">
              {{ t(`solarNetwork.features.${feature.key}.desc`) }}
            </p>
          </div>
          <div
            class="bg-base-300 flex items-center justify-center p-4"
            :class="feature.reverse ? 'md:order-1 order-2' : ''"
          >
            <NuxtImg
              :src="feature.image"
              class="rounded-xl shadow-md w-full max-w-md"
              :alt="feature.alt"
              width="640"
              height="480"
              sizes="sm:100vw md:50vw"
              loading="lazy"
              format="webp"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="feature in screenshotFeatures"
          :key="feature.key"
          class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5"
        >
          <div class="bg-base-300 p-4">
            <NuxtImg
              :src="feature.image"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              :alt="feature.alt"
              width="640"
              height="480"
              sizes="sm:100vw md:50vw lg:33vw"
              loading="lazy"
              format="webp"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div
                class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
              >
                <component
                  :is="feature.icon"
                  class="w-3.5 h-3.5 text-primary"
                />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t(`solarNetwork.features.${feature.key}.title`) }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t(`solarNetwork.features.${feature.key}.desc`) }}
            </p>
          </div>
        </div>

        <div
          v-for="feature in simpleFeatures"
          :key="feature.key"
          class="card bg-base-200 rounded-2xl border border-base-content/5 p-5"
        >
          <div
            class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3"
          >
            <component
              :is="feature.icon"
              class="w-[18px] h-[18px] text-primary"
            />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t(`solarNetwork.features.${feature.key}.title`) }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t(`solarNetwork.features.${feature.key}.desc`) }}
          </p>
        </div>
      </div>
    </section>

    <div class="divider" />

    <!-- Releases Section -->
    <section v-if="latest || releases.length > 0" class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <History class="w-5 h-5 text-primary" />
          {{ t("releases.title") }}
        </h2>
        <button
          v-if="latest"
          type="button"
          class="btn btn-sm btn-ghost gap-1"
          @click="toggleAllReleases"
        >
          {{ showAllReleases ? "Collapse" : t("releases.all") }}
          <ChevronUp v-if="showAllReleases" class="w-4 h-4" />
          <ChevronDown v-else class="w-4 h-4" />
        </button>
      </div>

      <ReleaseCard
        v-if="latest && !showAllReleases"
        :version="latest.version"
        :title="latest.title"
        :released-at="latest.releasedAt"
        :changelog="latest.changelog"
        :download-url="latest.downloadUrl"
        :is-prerelease="latest.isPrerelease"
      />

      <div v-if="showAllReleases && releasesLoading" class="py-4 text-center opacity-60">
        Loading releases…
      </div>

      <ReleaseTimeline
        v-else-if="showAllReleases && releases.length > 0"
        :releases="releases"
      />

      <div v-if="!latest && !releasesLoading" class="text-center py-4">
        <p class="opacity-60">{{ t("releases.noReleases") }}</p>
      </div>
    </section>

    <!-- Download -->
    <ProductDownloadSection
      :latest="latest"
      :loading="releasesLoading"
      :github-url="'https://github.com/Solsynth/Solian'"
      :platforms="platforms"
      badge-key="solarNetwork.download.btn"
      title-key="solarNetwork.download.sectionTitle"
      desc-key="solarNetwork.download.sectionDesc"
      view-github-key="solarNetwork.journey.viewGithub"
      release-expand-key="solarNetwork.download.release.expand"
      release-collapse-key="solarNetwork.download.release.collapse"
      brew-command="brew install --cask solsynth/solian/solian"
    />
    <!-- Reviews Section -->
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
        <!-- Summary + write CTA -->
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
            <p class="text-3xl font-bold tabular-nums mb-1">—</p>
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
              <StarRating
                :model-value="myReview.rating"
                size="xs"
                readonly
              />
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

        <!-- Review list -->
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
              {{ t("solarNetwork.help.title") }}
            </h2>
            <p class="text-lg opacity-80">{{ t("solarNetwork.help.desc") }}</p>
          </div>
          <div class="flex flex-wrap gap-4 justify-center">
            <a
              :href="docsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary btn-lg"
            >
              <BookOpen class="w-5 h-5" />
              {{ t("solarNetwork.docs") }}
            </a>
            <a
              href="https://github.com/Solsynth/Solian/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline btn-lg"
            >
              <Bug class="w-5 h-5" />
              {{ t("solarNetwork.help.reportIssue") }}
            </a>
            <a
              href="https://github.com/Solsynth/Solian/discussions"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost btn-lg"
            >
              <MessageSquare class="w-5 h-5" />
              {{ t("solarNetwork.help.suggestion") }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.solar-network-page {
  --color-primary: oklch(70% 0.08 275deg);
  --color-primary-content: oklch(95% 0.02 275deg);
}

.section-divider {
  height: 1px;
  margin-inline: auto;
  width: min(100% - 2rem, 1280px);
  background-color: color-mix(in oklab, currentColor 12%, transparent);
  opacity: 0.5;
}

:global([data-theme="dark"]) .solar-network-page {
  --color-primary: oklch(55% 0.08 275deg);
  --color-primary-content: oklch(95% 0.02 275deg);
}

.release-notes :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.release-notes :deep(ul),
.release-notes :deep(ol) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.release-notes :deep(pre),
.release-notes :deep(code) {
  font-size: 0.85em;
}

.release-notes :deep(h1),
.release-notes :deep(h2),
.release-notes :deep(h3) {
  margin-top: 0.75em;
  margin-bottom: 0.35em;
}
</style>
