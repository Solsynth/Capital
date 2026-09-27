<script setup lang="ts">
import ProductDownloadSection from "~/components/ProductDownloadSection.vue";
import type { ProductDownloadPlatform } from "~/types/product-download";
import {
  AppWindow,
  Bell,
  Bug,
  Building2,
  CodeXml,
  Database,
  Download,
  FileInput,
  GitBranch,
  HardDrive,
  Image,
  Kanban,
  Layers,
  LogIn,
  Mail,
  Monitor,
  RadioTower,
  Send,
  Star,
} from "@lucide/vue";
import IconsIconAndroid from "~/components/Icons/IconAndroid.vue";
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

const PRODUCT_SLUG = "sol-watt";
const REPO_URL = "https://src.solsynth.dev/SoSYS/SolWatt";

const aboutCards = [
  {
    icon: AppWindow,
    titleKey: "solWatt.aboutCard.shell.title",
    descKey: "solWatt.aboutCard.shell.desc",
  },
  {
    icon: Building2,
    titleKey: "solWatt.aboutCard.workspace.title",
    descKey: "solWatt.aboutCard.workspace.desc",
  },
  {
    icon: RadioTower,
    titleKey: "solWatt.aboutCard.realtime.title",
    descKey: "solWatt.aboutCard.realtime.desc",
  },
] as const;

const features = [
  {
    key: "signIn",
    icon: LogIn,
    titleKey: "solWatt.features.signIn.title",
    descKey: "solWatt.features.signIn.desc",
  },
  {
    key: "workspaces",
    icon: Layers,
    titleKey: "solWatt.features.workspaces.title",
    descKey: "solWatt.features.workspaces.desc",
  },
  {
    key: "mail",
    icon: Mail,
    titleKey: "solWatt.features.mail.title",
    descKey: "solWatt.features.mail.desc",
  },
  {
    key: "mailImport",
    icon: FileInput,
    titleKey: "solWatt.features.mailImport.title",
    descKey: "solWatt.features.mailImport.desc",
  },
  {
    key: "boards",
    icon: Kanban,
    titleKey: "solWatt.features.boards.title",
    descKey: "solWatt.features.boards.desc",
  },
  {
    key: "github",
    icon: GitBranch,
    titleKey: "solWatt.features.github.title",
    descKey: "solWatt.features.github.desc",
  },
  {
    key: "drive",
    icon: HardDrive,
    titleKey: "solWatt.features.drive.title",
    descKey: "solWatt.features.drive.desc",
  },
  {
    key: "viewer",
    icon: Image,
    titleKey: "solWatt.features.viewer.title",
    descKey: "solWatt.features.viewer.desc",
  },
  {
    key: "notifications",
    icon: Bell,
    titleKey: "solWatt.features.notifications.title",
    descKey: "solWatt.features.notifications.desc",
  },
  {
    key: "realtime",
    icon: RadioTower,
    titleKey: "solWatt.features.realtime.title",
    descKey: "solWatt.features.realtime.desc",
  },
  {
    key: "push",
    icon: Send,
    titleKey: "solWatt.features.push.title",
    descKey: "solWatt.features.push.desc",
  },
  {
    key: "desktop",
    icon: Monitor,
    titleKey: "solWatt.features.desktop.title",
    descKey: "solWatt.features.desktop.desc",
  },
  {
    key: "flywheel",
    icon: Database,
    titleKey: "solWatt.features.flywheel.title",
    descKey: "solWatt.features.flywheel.desc",
  },
] as const;

const platforms: ProductDownloadPlatform[] = [
  {
    id: "windows",
    label: "Windows",
    icon: Monitor,
    titleKey: "solWatt.download.windows.title",
    descKey: "solWatt.download.windows.desc",
    noticeKey: "solWatt.download.pendingNotice",
    actions: [
      {
        artifactPlatform: "windows",
        label: "solWatt.download.direct",
        i18n: true,
        variant: "primary",
        icon: Monitor,
      },
    ],
  },
  {
    id: "linux",
    label: "Linux",
    icon: IconsIconLinux,
    iconClass: "fill-current",
    titleKey: "solWatt.download.linux.title",
    descKey: "solWatt.download.linux.desc",
    noticeKey: "solWatt.download.pendingNotice",
    actions: [
      {
        artifactPlatform: "linux",
        label: "solWatt.download.direct",
        i18n: true,
        variant: "primary",
        icon: IconsIconLinux,
        iconClass: "fill-current",
      },
    ],
  },
  {
    id: "android",
    label: "Android",
    icon: IconsIconAndroid,
    iconClass: "fill-current",
    titleKey: "solWatt.download.android.title",
    descKey: "solWatt.download.android.desc",
    noticeKey: "solWatt.download.pendingNotice",
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
    titleKey: "solWatt.download.macos.title",
    descKey: "solWatt.download.macos.desc",
    noticeKey: "solWatt.download.macos.notice",
    actions: [
      {
        href: REPO_URL,
        label: "solWatt.download.buildFromSource",
        i18n: true,
        variant: "primary",
        icon: CodeXml,
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
  title: "SolWatt",
  description:
    "The Solar Network workspace client — mail, boards and a team cloud drive in one desktop-first app.",
});

useSeoMeta({
  description: () => t("solWatt.tagline"),
});

defineOgImage("UniOgImage", {
  title: "SolWatt",
  description: () => t("solWatt.tagline"),
  iconImage: "/images/sol-watt/icon.png",
  backgroundImage: "/images/sol-watt/main-visual.svg",
});
</script>

<template>
  <div class="sol-watt-page">
    <!-- Hero -->
    <section
      class="relative min-h-[64vh] flex items-end overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <NuxtImg
        src="/images/sol-watt/main-visual.svg"
        class="absolute inset-0 w-full h-full object-cover object-top -z-10 opacity-80"
        width="1600"
        height="1000"
        loading="eager"
        fetchpriority="high"
        format="webp"
        alt=""
        style="view-transition-name: product-hero-sol-watt"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/55 to-transparent dark:via-base-100/60"
      />

      <div class="relative container mx-auto px-4 pb-14 pt-44">
        <div class="hero-rise max-w-2xl">
          <NuxtImg
            src="/images/sol-watt/icon.png"
            class="w-14 h-14 rounded-2xl shadow-lg mb-5"
            alt="SolWatt"
            width="56"
            height="56"
            format="webp"
            loading="eager"
            decoding="async"
          />
          <p class="eyebrow mb-3">
            {{ t("solWatt.badgeWorkspace") }} &middot;
            {{ t("solWatt.badgeDesktop") }} &middot;
            {{ t("solWatt.openSource") }}
          </p>
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            SolWatt
          </h1>
          <p class="mt-3 text-base sm:text-lg opacity-75 leading-relaxed max-w-xl">
            {{ t("solWatt.tagline") }}
          </p>
          <p class="mt-5 font-mono text-sm opacity-80" aria-hidden="true">
            <span class="text-primary">$</span>
            solwatt attach solar-network<span
              class="caret ml-1 inline-block w-[9px] h-4 -mb-0.5 bg-primary/80 rounded-[1px]"
            />
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#download"
              class="btn btn-primary btn-md rounded-full px-6 gap-2"
            >
              <Download class="w-4 h-4" />
              {{ t("solWatt.download.btn") }}
            </a>
            <a
              :href="REPO_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost rounded-full px-5 gap-2"
            >
              <CodeXml class="w-4 h-4" />
              {{ t("solWatt.sourceCta") }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="container mx-auto px-4 py-24">
      <div class="max-w-2xl">
        <p class="eyebrow mb-3">{{ t("solWatt.about.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("solWatt.about.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("solWatt.about.desc") }}
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
        <p class="eyebrow mb-3">{{ t("solWatt.features.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("solWatt.features.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("solWatt.features.desc") }}
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
      :github-url="REPO_URL"
      :platforms="platforms"
      badge-key="solWatt.download.btn"
      title-key="solWatt.download.sectionTitle"
      desc-key="solWatt.download.sectionDesc"
      view-github-key="solWatt.download.viewGithub"
      release-expand-key="solWatt.download.release.expand"
      release-collapse-key="solWatt.download.release.collapse"
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
            {{ t("solWatt.help.title") }}
          </h2>
          <p class="mt-1.5 opacity-60">{{ t("solWatt.help.desc") }}</p>
        </div>
        <a
          :href="`${REPO_URL}/issues`"
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
.sol-watt-page {
  /* Amber — SolWatt's seed colour, deepened for light-theme contrast */
  --color-primary: oklch(62% 0.15 62deg);
  --color-primary-content: oklch(99% 0.01 62deg);
}

::global([data-theme="dark"]) .sol-watt-page {
  --color-primary: oklch(80% 0.13 70deg);
  --color-primary-content: oklch(25% 0.06 65deg);
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

@media (prefers-reduced-motion: reduce) {
  .hero-rise > *,
  .caret {
    animation: none;
  }
}
</style>
