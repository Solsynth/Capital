<script setup lang="ts">
import ProductDownloadSection from "~/components/ProductDownloadSection.vue";
import type { ProductDownloadPlatform } from "~/types/product-download";
import {
  AppWindow,
  Bug,
  CodeXml,
  Download,
  FolderGit2,
  Image,
  Keyboard,
  LayoutDashboard,
  Monitor,
  Palette,
  SquareTerminal,
  Star,
  TerminalSquare,
  Waves,
} from "@lucide/vue";
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
const PRODUCT_SLUG = "maid-term";
const GITHUB_REPO = "https://github.com/Solsynth/MaidTerm";

const aboutCards = [
  {
    icon: SquareTerminal,
    titleKey: "maidTerm.aboutCard.ghostty.title",
    descKey: "maidTerm.aboutCard.ghostty.desc",
  },
  {
    icon: Waves,
    titleKey: "maidTerm.aboutCard.localFirst.title",
    descKey: "maidTerm.aboutCard.localFirst.desc",
  },
  {
    icon: AppWindow,
    titleKey: "maidTerm.aboutCard.desktopNative.title",
    descKey: "maidTerm.aboutCard.desktopNative.desc",
  },
] as const;

const features = [
  {
    key: "pty",
    icon: TerminalSquare,
    titleKey: "maidTerm.features.pty.title",
    descKey: "maidTerm.features.pty.desc",
  },
  {
    key: "workspace",
    icon: LayoutDashboard,
    titleKey: "maidTerm.features.workspace.title",
    descKey: "maidTerm.features.workspace.desc",
  },
  {
    key: "graphics",
    icon: Image,
    titleKey: "maidTerm.features.graphics.title",
    descKey: "maidTerm.features.graphics.desc",
  },
  {
    key: "keyboard",
    icon: Keyboard,
    titleKey: "maidTerm.features.keyboard.title",
    descKey: "maidTerm.features.keyboard.desc",
  },
  {
    key: "color",
    icon: Palette,
    titleKey: "maidTerm.features.color.title",
    descKey: "maidTerm.features.color.desc",
  },
  {
    key: "osc",
    icon: CodeXml,
    titleKey: "maidTerm.features.osc.title",
    descKey: "maidTerm.features.osc.desc",
  },
  {
    key: "frameless",
    icon: Monitor,
    titleKey: "maidTerm.features.frameless.title",
    descKey: "maidTerm.features.frameless.desc",
  },
  {
    key: "engine",
    icon: FolderGit2,
    titleKey: "maidTerm.features.engine.title",
    descKey: "maidTerm.features.engine.desc",
  },
] as const;

const platforms: ProductDownloadPlatform[] = [
  {
    id: "macos",
    label: "macOS",
    icon: IconsIconMacos,
    iconClass: "fill-current",
    titleKey: "maidTerm.download.macos.title",
    descKey: "maidTerm.download.macos.desc",
    actions: [
      {
        artifactPlatform: "macos",
        label: "maidTerm.download.direct",
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
    titleKey: "maidTerm.download.windows.title",
    descKey: "maidTerm.download.windows.desc",
    actions: [
      {
        artifactPlatform: "windows",
        label: "maidTerm.download.direct",
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
    titleKey: "maidTerm.download.linux.title",
    descKey: "maidTerm.download.linux.desc",
    actions: [
      {
        artifactPlatform: "linux",
        label: "maidTerm.download.direct",
        i18n: true,
        variant: "primary",
        icon: IconsIconLinux,
        iconClass: "fill-current",
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
  title: "MaidTerm",
  description:
    "Local-first desktop terminal emulator for macOS, Windows, and Linux — powered by the Ghostty engine.",
});

useSeoMeta({
  description: () => t("maidTerm.tagline"),
});

defineOgImage("UniOgImage", {
  title: "MaidTerm",
  description: () => t("maidTerm.tagline"),
  iconImage: "/images/maid-term/icon.png",
  backgroundImage: "/images/maid-term/main-visual-og.png",
});
</script>

<template>
  <div class="maid-term-page">
    <!-- Hero -->
    <section
      class="relative overflow-hidden -mt-(--site-page-offset,64px) border-b border-base-content/5"
    >
      <div class="hero-glow absolute inset-0 -z-10" aria-hidden="true" />

      <div class="container mx-auto px-4 pt-40 pb-20">
        <div class="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-12 items-center">
          <div class="hero-rise max-w-xl">
            <NuxtImg
              src="/images/maid-term/icon.png"
              class="w-14 h-14 rounded-2xl shadow-lg mb-5"
              alt="MaidTerm"
              width="56"
              height="56"
              format="webp"
              loading="eager"
              decoding="async"
            />
            <p class="eyebrow mb-3">
              {{ t("maidTerm.badgeLocal") }} &middot;
              {{ t("maidTerm.badgeEngine") }} &middot;
              {{ t("maidTerm.openSource") }}
            </p>
            <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-mono">
              MaidTerm
            </h1>
            <p class="mt-3 text-base sm:text-lg opacity-75 leading-relaxed">
              {{ t("maidTerm.tagline") }}
            </p>
            <p class="mt-5 font-mono text-sm opacity-80" aria-hidden="true">
              <span class="text-primary">$</span>
              maidterm<span
                class="caret ml-1 inline-block w-[9px] h-4 -mb-0.5 bg-primary/80 rounded-[1px]"
              />
            </p>
            <div class="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#download"
                class="btn btn-primary btn-md rounded-full px-6 gap-2"
              >
                <Download class="w-4 h-4" />
                {{ t("maidTerm.download.btn") }}
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

          <div class="hero-rise" aria-hidden="true">
            <NuxtImg
              src="/images/maid-term/main-visual.webp"
              width="1600"
              height="1048"
              loading="eager"
              fetchpriority="high"
              format="webp"
              alt=""
              style="view-transition-name: product-hero-maid-term"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="container mx-auto px-4 py-24">
      <div class="max-w-2xl">
        <p class="eyebrow mb-3">{{ t("maidTerm.about.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("maidTerm.about.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("maidTerm.about.desc") }}
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
        <p class="eyebrow mb-3">{{ t("maidTerm.features.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("maidTerm.features.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("maidTerm.features.desc") }}
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
      badge-key="maidTerm.download.btn"
      title-key="maidTerm.download.sectionTitle"
      desc-key="maidTerm.download.sectionDesc"
      view-github-key="maidTerm.download.viewGithub"
      release-expand-key="maidTerm.download.release.expand"
      release-collapse-key="maidTerm.download.release.collapse"
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
            {{ t("maidTerm.help.title") }}
          </h2>
          <p class="mt-1.5 opacity-60">{{ t("maidTerm.help.desc") }}</p>
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
.maid-term-page {
  /* Salmon — MaidTerm's brand color #ff9e9b, deepened for light-theme contrast */
  --color-primary: oklch(64% 0.14 23deg);
  --color-primary-content: oklch(99% 0.01 23deg);
}

::global([data-theme="dark"]) .maid-term-page {
  --color-primary: oklch(80% 0.116 22deg);
  --color-primary-content: oklch(24% 0.06 23deg);
}

.hero-glow {
  background:
    radial-gradient(
      60rem 30rem at 72% 12%,
      oklch(80% 0.116 22deg / 0.18),
      transparent 62%
    ),
    linear-gradient(
      to bottom,
      color-mix(in oklab, oklch(80% 0.116 22deg) 7%, var(--color-base-100)),
      var(--color-base-100)
    );
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.5;
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
