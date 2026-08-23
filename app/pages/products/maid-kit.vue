<script setup lang="ts">
import ProductDownloadSection from "~/components/ProductDownloadSection.vue";
import type { ProductDownloadPlatform } from "~/types/product-download";
import {
  Activity,
  Bot,
  Box,
  Bug,
  Cable,
  CodeXml,
  Container,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FileCode2,
  FolderKanban,
  GitBranch,
  Globe,
  KeyRound,
  LayoutDashboard,
  Monitor,
  Network,
  Radio,
  Server,
  Settings2,
  Shield,
  SlidersHorizontal,
  Star,
  Terminal,
  Wrench,
} from "@lucide/vue";
import IconsIconAndroid from "~/components/Icons/IconAndroid.vue";
import IconsIconIos from "~/components/Icons/IconIos.vue";
import IconsIconLinux from "~/components/Icons/IconLinux.vue";
import IconsIconMacos from "~/components/Icons/IconMacos.vue";
import ReviewSummary from "~/components/ReviewSummary.vue";
import ReviewForm from "~/components/ReviewForm.vue";
import ReviewList from "~/components/ReviewList.vue";
import StarRating from "~/components/StarRating.vue";
import { useProductReleases } from "~/composables/useProductReleases";
import { useProductReviews } from "~/composables/useProductReviews";
import { useProductReviewSubmission } from "~/composables/useProductReviewSubmission";

const { t } = useI18n();

const PRODUCT_SLUG = "maid-kit";
const GITHUB_REPO = "https://github.com/Solsynth/MaidKit";
const TESTFLIGHT_URL = "https://testflight.apple.com/join/fVQB3qq5";

const aboutCards = [
  {
    icon: Server,
    titleKey: "maidKit.aboutCard.ssh.title",
    descKey: "maidKit.aboutCard.ssh.desc",
  },
  {
    icon: LayoutDashboard,
    titleKey: "maidKit.aboutCard.crossPlatform.title",
    descKey: "maidKit.aboutCard.crossPlatform.desc",
  },
  {
    icon: KeyRound,
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
    key: "processes",
    icon: Cpu,
    titleKey: "maidKit.features.processes.title",
    descKey: "maidKit.features.processes.desc",
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
    key: "databases",
    icon: Database,
    titleKey: "maidKit.features.databases.title",
    descKey: "maidKit.features.databases.desc",
  },
  {
    key: "tailscale",
    icon: Globe,
    titleKey: "maidKit.features.tailscale.title",
    descKey: "maidKit.features.tailscale.desc",
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
    key: "maidcafe",
    icon: Radio,
    titleKey: "maidKit.features.maidcafe.title",
    descKey: "maidKit.features.maidcafe.desc",
  },
  {
    key: "agent",
    icon: Bot,
    titleKey: "maidKit.features.agent.title",
    descKey: "maidKit.features.agent.desc",
  },
  {
    key: "github",
    icon: GitBranch,
    titleKey: "maidKit.features.github.title",
    descKey: "maidKit.features.github.desc",
  },
  {
    key: "mcp",
    icon: Cable,
    titleKey: "maidKit.features.mcp.title",
    descKey: "maidKit.features.mcp.desc",
  },
  {
    key: "security",
    icon: Shield,
    titleKey: "maidKit.features.security.title",
    descKey: "maidKit.features.security.desc",
  },
  {
    key: "settings",
    icon: SlidersHorizontal,
    titleKey: "maidKit.features.settings.title",
    descKey: "maidKit.features.settings.desc",
  },
] as const;

const platforms: ProductDownloadPlatform[] = [
  {
    id: "android",
    label: "Android",
    icon: IconsIconAndroid,
    iconClass: "fill-current",
    titleKey: "maidKit.download.android.title",
    descKey: "maidKit.download.android.desc",
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
        artifactPlatform: "windows",
        label: "maidKit.download.direct",
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
    titleKey: "maidKit.download.linux.title",
    descKey: "maidKit.download.linux.desc",
    actions: [
      {
        artifactPlatform: "linux",
        label: "maidKit.download.direct",
        i18n: true,
        variant: "primary",
        icon: ExternalLink,
      },
    ],
  },
];

const {
  releases,
  selected,
  loading: releasesLoading,
  fetchReleases,
  selectRelease,
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

const reviewFormOpen = ref(false);
const reviewForm = ref({
  rating: 0,
  title: "",
  content: "",
  isRecommended: null as boolean | null,
});

onMounted(async () => {
  await Promise.all([fetchReleases(), fetchMyReview(), refreshReviews()]);
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
      class="relative min-h-[64vh] flex items-end overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <NuxtImg
        src="/images/maid-kit/main-visual.webp"
        class="absolute inset-0 w-full h-full object-cover object-top -z-10 opacity-80"
        width="1920"
        height="694"
        loading="eager"
        fetchpriority="high"
        format="webp"
        alt=""
        style="view-transition-name: product-hero-maid-kit"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/55 to-transparent dark:via-base-100/60"
      />

      <div class="relative container mx-auto px-4 pb-14 pt-44">
        <div class="hero-rise max-w-2xl">
          <NuxtImg
            src="/images/maid-kit/icon.png"
            class="w-14 h-14 rounded-2xl shadow-lg mb-5"
            alt="MaidKit"
            width="56"
            height="56"
            format="webp"
            loading="eager"
            decoding="async"
          />
          <p class="eyebrow mb-3">
            {{ t("maidKit.badgeSsh") }} &middot;
            {{ t("maidKit.badgeCrossPlatform") }} &middot;
            {{ t("maidKit.openSource") }}
          </p>
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            MaidKit
          </h1>
          <p class="mt-3 text-base sm:text-lg opacity-75 leading-relaxed max-w-xl">
            {{ t("maidKit.tagline") }}
          </p>
          <p class="mt-5 font-mono text-sm opacity-80" aria-hidden="true">
            <span class="text-primary">$</span>
            ssh keeper@your-server<span
              class="caret ml-1 inline-block w-[9px] h-4 -mb-0.5 bg-primary/80 rounded-[1px]"
            />
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#download"
              class="btn btn-primary btn-md rounded-full px-6 gap-2"
            >
              <Download class="w-4 h-4" />
              {{ t("maidKit.download.btn") }}
            </a>
            <a
              :href="GITHUB_REPO"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost rounded-full px-5 gap-2"
            >
              <CodeXml class="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="container mx-auto px-4 py-24">
      <div class="max-w-2xl">
        <p class="eyebrow mb-3">{{ t("maidKit.about.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("maidKit.about.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("maidKit.about.desc") }}
        </p>
      </div>

      <div class="mt-14 grid md:grid-cols-3 gap-x-10 gap-y-10">
        <div
          v-for="card in aboutCards"
          :key="card.titleKey"
          class="pt-6 border-t border-base-content/10"
        >
          <component
            :is="card.icon"
            class="w-5 h-5 text-primary mb-3"
            aria-hidden="true"
          />
          <h3 class="font-semibold">{{ t(card.titleKey) }}</h3>
          <p class="mt-1.5 text-sm opacity-60 leading-relaxed">
            {{ t(card.descKey) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="container mx-auto px-4 py-24">
      <div class="max-w-2xl">
        <p class="eyebrow mb-3">{{ t("maidKit.features.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("maidKit.features.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("maidKit.features.desc") }}
        </p>
      </div>

      <ul class="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
        <li
          v-for="feature in features"
          :key="feature.key"
          class="flex items-start gap-4 py-5 border-t border-base-content/10"
        >
          <component
            :is="feature.icon"
            class="w-5 h-5 mt-0.5 text-primary shrink-0"
            aria-hidden="true"
          />
          <div class="min-w-0">
            <h3 class="text-sm font-semibold">{{ t(feature.titleKey) }}</h3>
            <p class="mt-1 text-sm opacity-55 leading-relaxed">
              {{ t(feature.descKey) }}
            </p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Download -->
    <ProductDownloadSection
      :release="selected"
      :releases="releases"
      :loading="releasesLoading"
      @select-release="selectRelease"
      :github-url="GITHUB_REPO"
      :platforms="platforms"
      badge-key="maidKit.download.btn"
      title-key="maidKit.download.sectionTitle"
      desc-key="maidKit.download.sectionDesc"
      view-github-key="maidKit.download.viewGithub"
      release-expand-key="maidKit.download.release.expand"
      release-collapse-key="maidKit.download.release.collapse"
    />

    <!-- Reviews -->
    <section class="container mx-auto px-4 py-24">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
        <div class="max-w-xl">
          <p class="eyebrow mb-3">{{ t("reviews.title") }}</p>
          <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
            {{ t("reviews.shareExperience") }}
          </h2>
        </div>
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
    <section class="container mx-auto px-4 pb-24">
      <div
        class="border-t border-base-content/10 pt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div class="max-w-xl">
          <h2 class="text-2xl font-semibold tracking-tight">
            {{ t("maidKit.help.title") }}
          </h2>
          <p class="mt-1.5 opacity-60">{{ t("maidKit.help.desc") }}</p>
        </div>
        <a
          :href="`${GITHUB_REPO}/issues`"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-outline btn-md rounded-full gap-2 shrink-0"
        >
          <Bug class="w-4 h-4" />
          {{ t("product.reportIssue") }}
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.maid-kit-page {
  /* Soft mauve — the "maid" palette, dialed down for calm */
  --color-primary: oklch(58% 0.09 320deg);
  --color-primary-content: oklch(98% 0.01 320deg);
}

::global([data-theme="dark"]) .maid-kit-page {
  --color-primary: oklch(74% 0.09 320deg);
  --color-primary-content: oklch(17% 0.03 320deg);
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.5;
}

.caret {
  animation: caret-blink 1.1s steps(1) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

/* One orchestrated moment: hero content rises on load */
.hero-rise > * {
  animation: hero-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero-rise > *:nth-child(2) {
  animation-delay: 0.06s;
}
.hero-rise > *:nth-child(3) {
  animation-delay: 0.12s;
}
.hero-rise > *:nth-child(4) {
  animation-delay: 0.18s;
}
.hero-rise > *:nth-child(5) {
  animation-delay: 0.24s;
}
.hero-rise > *:nth-child(6) {
  animation-delay: 0.3s;
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
