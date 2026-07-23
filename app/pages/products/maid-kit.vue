<script setup lang="ts">
import type { Component } from "vue";
import {
  Activity,
  Box,
  Bug,
  ChevronDown,
  ChevronUp,
  CodeXml,
  Container,
  Download,
  ExternalLink,
  FileCode2,
  FolderKanban,
  History,
  KeyRound,
  LayoutDashboard,
  Monitor,
  Network,
  Server,
  Settings2,
  Shield,
  Star,
  Tag,
  Terminal,
  Wrench,
} from "@lucide/vue";
import IconsIconAndroid from "~/components/Icons/IconAndroid.vue";
import IconsIconIos from "~/components/Icons/IconIos.vue";
import IconsIconLinux from "~/components/Icons/IconLinux.vue";
import IconsIconMacos from "~/components/Icons/IconMacos.vue";
import ReleaseCard from "~/components/ReleaseCard.vue";
import ReleaseTimeline from "~/components/ReleaseTimeline.vue";
import ReviewSummary from "~/components/ReviewSummary.vue";
import ReviewForm from "~/components/ReviewForm.vue";
import ReviewList from "~/components/ReviewList.vue";
import StarRating from "~/components/StarRating.vue";
import { useProductReleases } from "~/composables/useProductReleases";
import { useProductReviews } from "~/composables/useProductReviews";
import { useProductReviewSubmission } from "~/composables/useProductReviewSubmission";
import { renderMarkdown } from "~/utils/marked";

const { t, locale } = useI18n();

const PRODUCT_SLUG = "maid-kit";
const GITHUB_REPO = "https://github.com/Solsynth/MaidKit";
const GITHUB_RELEASES = `${GITHUB_REPO}/releases`;
const FS_BASE = "https://fs.solsynth.dev/d/r2/maidkit";
const TESTFLIGHT_URL = "https://testflight.apple.com/join/fVQB3qq5";

const aboutCards = [
  {
    icon: Server,
    bg: "bg-primary/20",
    iconClass: "text-primary",
    titleKey: "maidKit.aboutCard.ssh.title",
    descKey: "maidKit.aboutCard.ssh.desc",
  },
  {
    icon: LayoutDashboard,
    bg: "bg-secondary/20",
    iconClass: "text-secondary",
    titleKey: "maidKit.aboutCard.crossPlatform.title",
    descKey: "maidKit.aboutCard.crossPlatform.desc",
  },
  {
    icon: KeyRound,
    bg: "bg-accent/20",
    iconClass: "text-accent",
    titleKey: "maidKit.aboutCard.vault.title",
    descKey: "maidKit.aboutCard.vault.desc",
  },
] as const;

const features = [
  {
    key: "dashboard",
    icon: LayoutDashboard,
    titleKey: "maidKit.features.dashboard.title",
    descKey: "maidKit.features.dashboard.desc",
  },
  {
    key: "activity",
    icon: Activity,
    titleKey: "maidKit.features.activity.title",
    descKey: "maidKit.features.activity.desc",
  },
  {
    key: "terminal",
    icon: Terminal,
    titleKey: "maidKit.features.terminal.title",
    descKey: "maidKit.features.terminal.desc",
  },
  {
    key: "files",
    icon: FolderKanban,
    titleKey: "maidKit.features.files.title",
    descKey: "maidKit.features.files.desc",
  },
  {
    key: "services",
    icon: Settings2,
    titleKey: "maidKit.features.services.title",
    descKey: "maidKit.features.services.desc",
  },
  {
    key: "webServers",
    icon: Server,
    titleKey: "maidKit.features.webServers.title",
    descKey: "maidKit.features.webServers.desc",
  },
  {
    key: "ops",
    icon: Wrench,
    titleKey: "maidKit.features.ops.title",
    descKey: "maidKit.features.ops.desc",
  },
  {
    key: "tunnels",
    icon: Network,
    titleKey: "maidKit.features.tunnels.title",
    descKey: "maidKit.features.tunnels.desc",
  },
  {
    key: "containers",
    icon: Container,
    titleKey: "maidKit.features.containers.title",
    descKey: "maidKit.features.containers.desc",
  },
  {
    key: "projects",
    icon: Box,
    titleKey: "maidKit.features.projects.title",
    descKey: "maidKit.features.projects.desc",
  },
  {
    key: "snippets",
    icon: FileCode2,
    titleKey: "maidKit.features.snippets.title",
    descKey: "maidKit.features.snippets.desc",
  },
  {
    key: "security",
    icon: Shield,
    titleKey: "maidKit.features.security.title",
    descKey: "maidKit.features.security.desc",
  },
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
  actions: DownloadAction[];
};

const platforms: PlatformConfig[] = [
  {
    id: "android",
    label: "Android",
    icon: IconsIconAndroid,
    iconClass: "fill-current",
    titleKey: "maidKit.download.android.title",
    descKey: "maidKit.download.android.desc",
    actions: [
      {
        href: `${FS_BASE}/app-arm64-v8a-release.apk`,
        label: "ARM64 (arm64-v8a)",
        variant: "primary",
        icon: IconsIconAndroid,
        iconClass: "fill-current",
      },
      {
        href: `${FS_BASE}/app-armeabi-v7a-release.apk`,
        label: "ARMv7 (armeabi-v7a)",
        variant: "outline",
        icon: IconsIconAndroid,
        iconClass: "fill-current",
      },
      {
        href: `${FS_BASE}/app-x86_64-release.apk`,
        label: "x86_64",
        variant: "outline",
        icon: IconsIconAndroid,
        iconClass: "fill-current",
      },
      {
        href: GITHUB_RELEASES,
        label: "maidKit.download.github",
        i18n: true,
        variant: "ghost",
        icon: CodeXml,
      },
    ],
  },
  {
    id: "ios",
    label: "iOS",
    icon: IconsIconIos,
    iconClass: "fill-current",
    titleKey: "maidKit.download.ios.title",
    descKey: "maidKit.download.ios.desc",
    actions: [
      {
        href: TESTFLIGHT_URL,
        label: "maidKit.download.ios.testflight",
        i18n: true,
        variant: "primary",
        icon: IconsIconIos,
        iconClass: "fill-current",
      },
      {
        href: GITHUB_RELEASES,
        label: "maidKit.download.github",
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
    titleKey: "maidKit.download.macos.title",
    descKey: "maidKit.download.macos.desc",
    actions: [
      {
        href: TESTFLIGHT_URL,
        label: "maidKit.download.macos.testflight",
        i18n: true,
        variant: "primary",
        icon: IconsIconMacos,
        iconClass: "fill-current",
      },
      {
        href: `${FS_BASE}/maidkit-macos.tar.gz`,
        label: "maidKit.download.direct",
        i18n: true,
        variant: "outline",
        icon: ExternalLink,
      },
      {
        href: GITHUB_RELEASES,
        label: "maidKit.download.github",
        i18n: true,
        variant: "ghost",
        icon: CodeXml,
      },
    ],
  },
  {
    id: "windows",
    label: "Windows",
    icon: Monitor,
    titleKey: "maidKit.download.windows.title",
    descKey: "maidKit.download.windows.desc",
    actions: [
      {
        href: `${FS_BASE}/build-output-windows-installer.zip`,
        label: "maidKit.download.direct",
        i18n: true,
        variant: "primary",
        icon: ExternalLink,
      },
      {
        href: GITHUB_RELEASES,
        label: "maidKit.download.github",
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
    titleKey: "maidKit.download.linux.title",
    descKey: "maidKit.download.linux.desc",
    actions: [
      {
        href: `${FS_BASE}/build-output-linux-appimage.zip`,
        label: "maidKit.download.direct",
        i18n: true,
        variant: "primary",
        icon: ExternalLink,
      },
      {
        href: GITHUB_RELEASES,
        label: "maidKit.download.github",
        i18n: true,
        variant: "outline",
        icon: CodeXml,
      },
    ],
  },
];

const activePlatform = ref("android");
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

const releaseExpanded = ref(false);

const { data: latestRelease } = await useFetch(
  "https://api.github.com/repos/Solsynth/MaidKit/releases/latest",
  {
    transform: (
      data: {
        tag_name?: string;
        name?: string;
        body?: string;
        html_url?: string;
        published_at?: string;
      } | null,
    ) => {
      if (!data?.tag_name) return null;
      return {
        tag: data.tag_name,
        name: data.name,
        body: data.body,
        url: data.html_url,
        date: data.published_at
          ? new Date(data.published_at).toLocaleDateString(
              locale.value === "zh" ? "zh-CN" : "en-US",
              { year: "numeric", month: "long", day: "numeric" },
            )
          : "",
      };
    },
  },
);

const releaseBodyHtml = computed(() =>
  latestRelease.value?.body
    ? renderMarkdown(latestRelease.value.body)
    : "",
);

const {
  releases,
  latest,
  loading: releasesLoading,
  fetchLatest,
} = useProductReleases(PRODUCT_SLUG);
const showAllReleases = ref(false);

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

onMounted(async () => {
  await Promise.all([fetchLatest(), fetchMyReview(), refreshReviews()]);
});

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
  title: "MaidKit",
  description: "Cross-platform SSH server manager — non-intrusive maintenance over SSH.",
});

useSeoMeta({
  description: () => t("maidKit.tagline"),
});

defineOgImage("UniOgImage", {
  title: "MaidKit",
  description: () => t("maidKit.tagline"),
  iconImage: "/images/maid-kit/icon.png",
  backgroundImage: "/images/maid-kit/main-visual-og.png",
});
</script>

<template>
  <div class="maid-kit-page">
    <!-- Hero -->
    <section
      class="relative h-[70vh] min-h-120 overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <NuxtImg
        src="/images/maid-kit/main-visual.webp"
        class="absolute inset-0 w-full h-full object-cover object-top -z-10 opacity-90"
        loading="eager"
        format="webp"
        alt=""
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/30 to-transparent dark:via-base-100/50"
      />

      <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
        <div
          class="container mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6"
        >
          <div class="flex items-center gap-3 sm:gap-4 min-w-0 md:min-w-0 md:flex-1 md:pr-6">
            <img
              src="/images/maid-kit/icon.png"
              class="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-xl md:rounded-2xl shadow-2xl shrink-0"
              alt="MaidKit"
              width="112"
              height="112"
            />
            <div class="min-w-0">
              <h1 class="text-2xl sm:text-4xl md:text-5xl font-bold mb-0.5 sm:mb-2">
                MaidKit
              </h1>
              <p class="text-sm sm:text-xl opacity-90 line-clamp-2">
                {{ t("maidKit.tagline") }}
              </p>
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <span class="badge badge-primary badge-sm gap-1">
                  <Terminal class="w-3.5 h-3.5" />
                  {{ t("maidKit.badgeSsh") }}
                </span>
                <span class="badge badge-ghost badge-sm">
                  {{ t("maidKit.badgeCrossPlatform") }}
                </span>
                <span class="badge badge-ghost badge-sm">
                  {{ t("maidKit.openSource") }}
                </span>
              </div>
            </div>
          </div>

          <div
            class="flex flex-row flex-wrap items-center gap-2 w-full md:w-auto md:shrink-0 md:ml-auto md:justify-end md:gap-3"
          >
            <a
              href="#download"
              class="btn btn-primary btn-sm sm:btn-md md:btn-lg rounded-full gap-1.5 flex-1 sm:flex-none"
            >
              <Download class="w-4 h-4 sm:w-5 sm:h-5" />
              {{ t("maidKit.download.btn") }}
            </a>
            <a
              :href="GITHUB_REPO"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline btn-sm sm:btn-md md:btn-lg rounded-full gap-1.5 flex-1 sm:flex-none"
            >
              <CodeXml class="w-4 h-4 sm:w-5 sm:h-5" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="divider mt-0 h-px" />

    <!-- About -->
    <section class="container mx-auto px-4 pt-24 pb-16">
      <div class="text-center mb-12">
        <span class="badge badge-primary badge-outline mb-4">{{
          t("maidKit.about.badge")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("maidKit.about.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-3xl mx-auto">
          {{ t("maidKit.about.desc") }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="card in aboutCards"
          :key="card.titleKey"
          class="card bg-base-200 hover:bg-base-300 transition-colors duration-150 p-8 border border-base-content/5"
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

    <!-- Features -->
    <section class="container mx-auto px-4 py-16">
      <div class="text-center mb-16">
        <span class="badge badge-secondary badge-outline mb-4">{{
          t("maidKit.features.badge")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("maidKit.features.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-2xl mx-auto">
          {{ t("maidKit.features.desc") }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="feature in features"
          :key="feature.key"
          class="card bg-base-200 rounded-2xl border border-base-content/5 p-6"
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
    </section>

    <div class="divider" />

    <!-- Product-managed releases (admin CMS) -->
    <section
      v-if="latest || (!releasesLoading && releases.length > 0)"
      class="container mx-auto px-4 py-8"
    >
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
    </section>

    <!-- Download -->
    <section id="download" class="container mx-auto px-4 py-16 scroll-mt-24">
      <div class="text-center mb-12">
        <span class="badge badge-accent badge-outline mb-4">{{
          t("maidKit.download.btn")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("maidKit.download.sectionTitle") }}
        </h2>
        <p class="text-lg opacity-70 max-w-2xl mx-auto">
          {{ t("maidKit.download.sectionDesc") }}
        </p>
      </div>

      <!-- Latest GitHub release notes -->
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
              v-if="
                latestRelease.name && latestRelease.name !== latestRelease.tag
              "
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
            {{ t("maidKit.download.release.viewOnGithub") }}
          </a>
        </div>

        <div v-if="releaseBodyHtml" class="relative">
          <div
            class="prose prose-sm max-w-none px-5 py-4 release-notes"
            :class="releaseExpanded ? 'max-h-none' : 'max-h-56 overflow-hidden'"
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
              <ChevronDown v-if="!releaseExpanded" class="w-3.5 h-3.5" />
              <ChevronUp v-else class="w-3.5 h-3.5" />
              {{
                releaseExpanded
                  ? t("maidKit.download.release.collapse")
                  : t("maidKit.download.release.expand")
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
            :aria-label="t('maidKit.download.btn')"
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
          :href="GITHUB_REPO"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-ghost btn-sm gap-2"
        >
          <CodeXml class="w-4 h-4" />
          {{ t("maidKit.download.viewGithub") }}
        </a>
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
              {{ t("maidKit.help.title") }}
            </h2>
            <p class="text-lg opacity-80">
              {{ t("maidKit.help.desc") }}
            </p>
          </div>
          <div class="flex flex-wrap gap-4 justify-center">
            <a
              :href="`${GITHUB_REPO}/issues`"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline btn-lg gap-2"
            >
              <Bug class="w-5 h-5" />
              {{ t("product.reportIssue") }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.maid-kit-page {
  /* Soft lavender / pink aligned with the character palette */
  --color-primary: oklch(62% 0.12 320deg);
  --color-primary-content: oklch(98% 0.01 320deg);
  --color-secondary: oklch(58% 0.1 280deg);
  --color-accent: oklch(65% 0.14 20deg);
}

:global([data-theme="dark"]) .maid-kit-page {
  --color-primary: oklch(78% 0.1 320deg);
  --color-primary-content: oklch(18% 0.03 320deg);
  --color-secondary: oklch(72% 0.08 280deg);
  --color-accent: oklch(75% 0.1 25deg);
}

.release-notes :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
