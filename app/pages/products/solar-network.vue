<script setup lang="ts">
import type { Component } from "vue";
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
  Copy,
  Check,
  SmilePlus,
  History,
  ChevronDown,
  ChevronUp,
  Star,
  BookOpen,
  Download,
  Tag,
} from "@lucide/vue";
import IconsIconIos from "~/components/Icons/IconIos.vue";
import IconsIconAndroid from "~/components/Icons/IconAndroid.vue";
import IconsIconMacos from "~/components/Icons/IconMacos.vue";
import IconsIconLinux from "~/components/Icons/IconLinux.vue";
import { renderMarkdown } from "~/utils/marked";

const { t, locale } = useI18n();

const PRODUCT_SLUG = "solar-network";
const BREW_COMMAND = "brew install --cask solsynth/solian/solian";
const docsUrl = computed(() =>
  locale.value === "zh"
    ? "https://kb.solsynth.dev/zh/solar-network/account/"
    : "https://kb.solsynth.dev/solar-network/account/",
);
const activePlatform = ref("web");
const copied = ref(false);
const releaseExpanded = ref(false);
const showAllReleases = ref(false);
const reviewFormOpen = ref(false);
const reviewForm = ref({
  rating: 0,
  title: "",
  content: "",
  isRecommended: null as boolean | null,
});

const { data: latestRelease } = await useFetch("/api/github-release", {
  transform: (data: {
    tag?: string;
    name?: string;
    body?: string;
    url?: string;
    date?: string;
  } | null) => {
    if (!data) return null;
    return {
      tag: data.tag,
      name: data.name,
      body: data.body,
      url: data.url,
      date: new Date(data.date!).toLocaleDateString(
        locale.value === "zh" ? "zh-CN" : "en-US",
        { year: "numeric", month: "long", day: "numeric" },
      ),
    };
  },
});

const releaseBodyHtml = computed(() =>
  latestRelease.value?.body
    ? renderMarkdown(latestRelease.value.body)
    : "",
);

const {
  releases,
  latest,
  loading: releasesLoading,
  refresh: refreshReleases,
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
  void Promise.all([refreshReleases(), fetchMyReview(), refreshReviews()]);
});

async function copyCommand() {
  try {
    await navigator.clipboard.writeText(BREW_COMMAND);
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

type DownloadAction = {
  href: string;
  label: string;
  i18n?: boolean;
  variant: "primary" | "outline" | "ghost";
  icon: Component;
  iconClass?: string;
};

type PlatformConfig = {
  id: string;
  label: string;
  icon: Component;
  iconClass?: string;
  titleKey: string;
  descKey: string;
  brew?: boolean;
  actions: DownloadAction[];
};

const platforms: PlatformConfig[] = [
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
        href: "https://fs.solsynth.dev/d/r2/solian/app-arm64-v8a-release.apk",
        label: "ARM64 (arm64-v8a)",
        variant: "primary",
        icon: IconsIconAndroid,
        iconClass: "fill-current",
      },
      {
        href: "https://fs.solsynth.dev/d/r2/solian/app-armeabi-v7a-release.apk",
        label: "ARMv7 (armeabi-v7a)",
        variant: "outline",
        icon: IconsIconAndroid,
        iconClass: "fill-current",
      },
      {
        href: "https://fs.solsynth.dev/d/r2/solian/app-x86_64-release.apk",
        label: "x86_64",
        variant: "outline",
        icon: IconsIconAndroid,
        iconClass: "fill-current",
      },
      {
        href: "https://github.com/Solsynth/Solian/releases",
        label: "solarNetwork.download.github",
        i18n: true,
        variant: "ghost",
        icon: CodeXml,
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
        href: "https://fs.solsynth.dev/d/r2/solian/solian-macos.tar.gz",
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
        href: "https://fs.solsynth.dev/d/r2/solian/build-output-windows-installer.zip",
        label: "solarNetwork.download.direct",
        i18n: true,
        variant: "primary",
        icon: ExternalLink,
      },
      {
        href: "https://github.com/Solsynth/Solian/releases",
        label: "solarNetwork.download.github",
        i18n: true,
        variant: "outline",
        icon: CodeXml,
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
        href: "https://fs.solsynth.dev/d/r2/solian/build-output-linux-appimage.zip",
        label: "solarNetwork.download.direct",
        i18n: true,
        variant: "primary",
        icon: ExternalLink,
      },
      {
        href: "https://github.com/Solsynth/Solian/releases",
        label: "solarNetwork.download.github",
        i18n: true,
        variant: "outline",
        icon: CodeXml,
      },
    ],
  },
];

const currentPlatform = computed(
  () => platforms.find((p) => p.id === activePlatform.value) ?? platforms[0],
);

const actionRowClass: Record<DownloadAction["variant"], string> = {
  primary:
    "border-primary/25 bg-primary/10 hover:bg-primary/15 text-base-content",
  outline:
    "border-base-content/10 bg-base-100 hover:bg-base-300/60 text-base-content",
  ghost:
    "border-transparent bg-transparent hover:bg-base-300/50 text-base-content/80",
};

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
        loading="eager"
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
            <img
              src="/images/solar-network/icon.png"
              class="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-xl md:rounded-2xl shadow-2xl shrink-0"
              alt="Solar Network"
              width="112"
              height="112"
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
    <section v-if="releases.length > 0" class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <History class="w-5 h-5 text-primary" />
          {{ t("releases.title") }}
        </h2>
        <button
          v-if="releases.length > 1"
          type="button"
          class="btn btn-sm btn-ghost gap-1"
          @click="showAllReleases = !showAllReleases"
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
        :github-release-url="latest.githubReleaseUrl"
        :is-prerelease="latest.isPrerelease"
      />

      <ReleaseTimeline
        v-else-if="showAllReleases && releases.length > 0"
        :releases="releases"
      />

      <div v-if="!latest && !releasesLoading" class="text-center py-4">
        <p class="opacity-60">{{ t("releases.noReleases") }}</p>
      </div>
    </section>

    <!-- Download -->
    <section id="download" class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <span class="badge badge-accent badge-outline mb-4">{{
          t("solarNetwork.download.btn")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("solarNetwork.download.sectionTitle") }}
        </h2>
        <p class="text-lg opacity-70 max-w-2xl mx-auto">
          {{ t("solarNetwork.download.sectionDesc") }}
        </p>
      </div>

      <!-- Latest GitHub release -->
      <div
        v-if="latestRelease"
        class="mb-8 rounded-xl border border-base-content/5 bg-base-200 overflow-hidden"
      >
        <div
          class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-base-content/5 bg-base-300/40"
        >
          <div class="flex items-center gap-2.5 flex-wrap min-w-0">
            <Tag class="w-4 h-4 text-primary shrink-0" />
            <span class="badge badge-primary badge-soft font-mono">{{
              latestRelease.tag
            }}</span>
            <span
              v-if="latestRelease.name && latestRelease.name !== latestRelease.tag"
              class="text-sm font-medium truncate max-w-[min(100%,20rem)]"
            >
              {{ latestRelease.name }}
            </span>
            <span class="text-sm opacity-50">{{ latestRelease.date }}</span>
          </div>
          <a
            v-if="latestRelease.url"
            :href="latestRelease.url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-sm gap-1.5 shrink-0"
          >
            <ExternalLink class="w-4 h-4" />
            {{ t("solarNetwork.download.release.viewOnGithub") }}
          </a>
        </div>

        <div v-if="releaseBodyHtml" class="relative">
          <div
            class="prose prose-sm max-w-none px-5 py-4 release-notes"
            :class="
              releaseExpanded
                ? 'max-h-none'
                : 'max-h-56 overflow-hidden'
            "
            v-html="releaseBodyHtml"
          />
          <div
            v-if="!releaseExpanded"
            class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-base-200 to-transparent"
          />
          <div class="flex justify-center px-5 pb-4">
            <button
              type="button"
              class="btn btn-ghost btn-xs gap-1 relative z-10"
              @click="releaseExpanded = !releaseExpanded"
            >
              <ChevronDown
                v-if="!releaseExpanded"
                class="w-3.5 h-3.5"
              />
              <ChevronUp v-else class="w-3.5 h-3.5" />
              {{
                releaseExpanded
                  ? t("solarNetwork.download.release.collapse")
                  : t("solarNetwork.download.release.expand")
              }}
            </button>
          </div>
        </div>
      </div>

      <!-- Platform downloads -->
      <div
        class="rounded-xl border border-base-content/5 bg-base-200 overflow-hidden"
      >
        <div class="grid md:grid-cols-[220px_minmax(0,1fr)]">
          <nav
            class="flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto md:overflow-x-visible border-b md:border-b-0 md:border-r border-base-content/5"
            role="tablist"
            :aria-label="t('solarNetwork.download.btn')"
          >
            <button
              v-for="platform in platforms"
              :key="platform.id"
              type="button"
              role="tab"
              :aria-selected="activePlatform === platform.id"
              class="btn btn-sm md:btn-md justify-start gap-2.5 shrink-0 md:w-full border-0"
              :class="
                activePlatform === platform.id
                  ? 'btn-primary'
                  : 'btn-ghost opacity-70 hover:opacity-100'
              "
              @click="activePlatform = platform.id"
            >
              <component
                :is="platform.icon"
                class="w-4 h-4 md:w-5 md:h-5 shrink-0"
                :class="platform.iconClass"
              />
              <span class="hidden sm:inline">{{ platform.label }}</span>
            </button>
          </nav>

          <div
            v-if="currentPlatform"
            class="p-5 sm:p-6 md:p-8 min-h-[280px]"
            role="tabpanel"
          >
            <div class="flex items-start gap-3 mb-2">
              <div
                class="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"
              >
                <component
                  :is="currentPlatform.icon"
                  class="w-6 h-6 text-primary"
                  :class="
                    currentPlatform.iconClass
                      ? `${currentPlatform.iconClass} fill-primary`
                      : undefined
                  "
                />
              </div>
              <div class="min-w-0">
                <h3 class="text-xl md:text-2xl font-bold">
                  {{ t(currentPlatform.titleKey) }}
                </h3>
                <p class="text-sm opacity-65 mt-1 leading-relaxed">
                  {{ t(currentPlatform.descKey) }}
                </p>
              </div>
            </div>

            <div v-if="currentPlatform.brew" class="mt-6 mb-5">
              <p class="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">
                Homebrew
              </p>
              <div
                class="rounded-lg border border-base-content/10 bg-base-100 px-3 py-2.5 flex items-center gap-2"
              >
                <code class="flex-1 text-xs sm:text-sm font-mono break-all">{{
                  BREW_COMMAND
                }}</code>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm btn-square shrink-0"
                  :aria-label="copied ? 'Copied' : 'Copy command'"
                  @click="copyCommand"
                >
                  <Check v-if="copied" class="w-4 h-4 text-success" />
                  <Copy v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="mt-6 space-y-2">
              <a
                v-for="action in currentPlatform.actions"
                :key="action.href + action.label"
                :href="action.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
                :class="actionRowClass[action.variant]"
              >
                <component
                  :is="action.icon"
                  class="w-5 h-5 shrink-0 opacity-80"
                  :class="action.iconClass"
                />
                <span class="flex-1 text-sm font-medium min-w-0">
                  {{ action.i18n ? t(action.label) : action.label }}
                </span>
                <Download
                  v-if="action.variant === 'primary'"
                  class="w-4 h-4 shrink-0 opacity-60"
                />
                <ExternalLink v-else class="w-4 h-4 shrink-0 opacity-50" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-6">
        <a
          href="https://github.com/Solsynth/Solian"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-ghost btn-sm gap-2"
        >
          <CodeXml class="w-4 h-4" />
          {{ t("solarNetwork.journey.viewGithub") }}
        </a>
      </div>
    </section>

    <div class="divider" />

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
