<script setup lang="ts">
import {
  AppWindow,
  Bot,
  Braces,
  Bug,
  CodeXml,
  Download,
  Gauge,
  Globe,
  HandHeart,
  HeartPulse,
  Layers,
  Mic,
  Plug,
  ScrollText,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
} from "@lucide/vue";
import ReviewSummary from "~/components/ReviewSummary.vue";
import ProductDownloadsCta from "~/components/ProductDownloadsCta.vue";
import ReviewForm from "~/components/ReviewForm.vue";
import ReviewList from "~/components/ReviewList.vue";
import StarRating from "~/components/StarRating.vue";
import { useProductReviews } from "~/composables/useProductReviews";
import { useProductReviewSubmission } from "~/composables/useProductReviewSubmission";

const { t } = useI18n();

const PRODUCT_SLUG = "persynth";
const REPO_URL = "https://src.solsynth.dev/Solsynth/SynthPet";

const aboutCards = [
  {
    icon: AppWindow,
    titleKey: "persynth.aboutCard.island.title",
    descKey: "persynth.aboutCard.island.desc",
  },
  {
    icon: HeartPulse,
    titleKey: "persynth.aboutCard.localLife.title",
    descKey: "persynth.aboutCard.localLife.desc",
  },
  {
    icon: Sparkles,
    titleKey: "persynth.aboutCard.core.title",
    descKey: "persynth.aboutCard.core.desc",
  },
] as const;

const features = [
  {
    key: "face",
    icon: Smile,
    titleKey: "persynth.features.face.title",
    descKey: "persynth.features.face.desc",
  },
  {
    key: "moods",
    icon: HeartPulse,
    titleKey: "persynth.features.moods.title",
    descKey: "persynth.features.moods.desc",
  },
  {
    key: "care",
    icon: HandHeart,
    titleKey: "persynth.features.care.title",
    descKey: "persynth.features.care.desc",
  },
  {
    key: "chat",
    icon: Bot,
    titleKey: "persynth.features.chat.title",
    descKey: "persynth.features.chat.desc",
  },
  {
    key: "traces",
    icon: ScrollText,
    titleKey: "persynth.features.traces.title",
    descKey: "persynth.features.traces.desc",
  },
  {
    key: "voice",
    icon: Mic,
    titleKey: "persynth.features.voice.title",
    descKey: "persynth.features.voice.desc",
  },
  {
    key: "harness",
    icon: ShieldCheck,
    titleKey: "persynth.features.harness.title",
    descKey: "persynth.features.harness.desc",
  },
  {
    key: "switches",
    icon: Plug,
    titleKey: "persynth.features.switches.title",
    descKey: "persynth.features.switches.desc",
  },
  {
    key: "sets",
    icon: Layers,
    titleKey: "persynth.features.sets.title",
    descKey: "persynth.features.sets.desc",
  },
  {
    key: "sandbox",
    icon: Braces,
    titleKey: "persynth.features.sandbox.title",
    descKey: "persynth.features.sandbox.desc",
  },
  {
    key: "webtools",
    icon: Globe,
    titleKey: "persynth.features.webtools.title",
    descKey: "persynth.features.webtools.desc",
  },
  {
    key: "bond",
    icon: Gauge,
    titleKey: "persynth.features.bond.title",
    descKey: "persynth.features.bond.desc",
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

onMounted(async () => {
  await Promise.all([fetchMyReview(), refreshReviews()]);
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
  title: "Persynth",
  description:
    "A quiet island-style desktop pet companion with an ASCII face and a Personality Core.",
});

useSeoMeta({
  description: () => t("persynth.tagline"),
});

defineOgImage("UniOgImage", {
  title: "Persynth",
  description: () => t("persynth.tagline"),
  iconImage: "/images/persynth/icon.png",
  backgroundImage: "/images/persynth/main-visual.svg",
});
</script>

<template>
  <div class="persynth-page">
    <!-- Hero -->
    <section
      class="relative min-h-[64vh] flex items-end overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <NuxtImg
        src="/images/persynth/main-visual.svg"
        class="absolute inset-0 w-full h-full object-cover object-top -z-10 opacity-80"
        width="1600"
        height="1000"
        loading="eager"
        fetchpriority="high"
        format="webp"
        alt=""
        style="view-transition-name: product-hero-persynth"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/55 to-transparent dark:via-base-100/60"
      />

      <div class="relative container mx-auto px-4 pb-14 pt-44">
        <div class="hero-rise max-w-2xl">
          <NuxtImg
            src="/images/persynth/icon.png"
            class="w-14 h-14 rounded-2xl shadow-lg mb-5"
            alt="Persynth"
            width="56"
            height="56"
            format="webp"
            loading="eager"
            decoding="async"
          />
          <p class="eyebrow mb-3">
            {{ t("persynth.badgeIsland") }} &middot;
            {{ t("persynth.badgeAscii") }} &middot;
            {{ t("persynth.badgePlugins") }}
          </p>
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Persynth
          </h1>
          <p class="mt-3 text-base sm:text-lg opacity-75 leading-relaxed max-w-xl">
            {{ t("persynth.tagline") }}
          </p>
          <p class="mt-5 font-mono text-sm opacity-80" aria-hidden="true">
            <span class="text-primary">0.0</span>
            mochi is here<span
              class="caret ml-1 inline-block w-[9px] h-4 -mb-0.5 bg-primary/80 rounded-[1px]"
            />
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#download"
              class="btn btn-primary btn-md rounded-full px-6 gap-2"
            >
              <Download class="w-4 h-4" />
              {{ t("persynth.download.btn") }}
            </a>
            <a
              :href="REPO_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost rounded-full px-5 gap-2"
            >
              <CodeXml class="w-4 h-4" />
              {{ t("persynth.sourceCta") }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="container mx-auto px-4 py-24">
      <div class="max-w-2xl">
        <p class="eyebrow mb-3">{{ t("persynth.about.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("persynth.about.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("persynth.about.desc") }}
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
        <p class="eyebrow mb-3">{{ t("persynth.features.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("persynth.features.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("persynth.features.desc") }}
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
    <ProductDownloadsCta :slug="PRODUCT_SLUG" product-title="Persynth" />

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
            {{ t("persynth.help.title") }}
          </h2>
          <p class="mt-1.5 opacity-60">{{ t("persynth.help.desc") }}</p>
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
.persynth-page {
  /* Rose — taken from the icon artwork, deepened for light-theme contrast */
  --color-primary: oklch(66% 0.14 6deg);
  --color-primary-content: oklch(99% 0.01 6deg);
}

::global([data-theme="dark"]) .persynth-page {
  --color-primary: oklch(80% 0.1 8deg);
  --color-primary-content: oklch(24% 0.05 8deg);
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
