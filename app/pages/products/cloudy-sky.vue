<script setup lang="ts">
import {
  Bell,
  Bug,
  CheckCircle,
  CodeXml,
  History,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  RefreshCw,
  Shield,
  Smartphone,
  Star,
  Wifi,
  Zap,
} from "@lucide/vue";
import IconsIconAndroid from "~/components/Icons/IconAndroid.vue";
import ReviewSummary from "~/components/ReviewSummary.vue";
import ReviewForm from "~/components/ReviewForm.vue";
import ReviewList from "~/components/ReviewList.vue";
import { useProductReleases } from "~/composables/useProductReleases";
import { useProductReviews } from "~/composables/useProductReviews";
import { useProductReviewSubmission } from "~/composables/useProductReviewSubmission";

const { t } = useI18n();

const PRODUCT_SLUG = "cloudy-sky";

const aboutCards = [
  {
    icon: Bell,
    titleKey: "cloudySky.aboutCard.notifications.title",
    descKey: "cloudySky.aboutCard.notifications.desc",
  },
  {
    icon: Shield,
    titleKey: "cloudySky.aboutCard.secure.title",
    descKey: "cloudySky.aboutCard.secure.desc",
  },
  {
    icon: Zap,
    titleKey: "cloudySky.aboutCard.realtime.title",
    descKey: "cloudySky.aboutCard.realtime.desc",
  },
] as const;

const features = [
  {
    key: "oidc",
    icon: Shield,
    titleKey: "cloudySky.features.oidc.title",
    descKey: "cloudySky.features.oidc.desc",
  },
  {
    key: "sse",
    icon: Zap,
    titleKey: "cloudySky.features.sse.title",
    descKey: "cloudySky.features.sse.desc",
  },
  {
    key: "grouping",
    icon: MessageSquare,
    titleKey: "cloudySky.features.grouping.title",
    descKey: "cloudySky.features.grouping.desc",
  },
  {
    key: "media",
    icon: Smartphone,
    titleKey: "cloudySky.features.media.title",
    descKey: "cloudySky.features.media.desc",
  },
  {
    key: "reply",
    icon: RefreshCw,
    titleKey: "cloudySky.features.reply.title",
    descKey: "cloudySky.features.reply.desc",
  },
  {
    key: "settings",
    icon: Wifi,
    titleKey: "cloudySky.features.settings.title",
    descKey: "cloudySky.features.settings.desc",
  },
] as const;

const {
  releases,
  latest,
  loading: releasesLoading,
  fetchReleases,
  fetchLatest,
} = useProductReleases(PRODUCT_SLUG);
const showAllReleases = ref(false);

async function toggleAllReleases() {
  showAllReleases.value = !showAllReleases.value;
  if (showAllReleases.value && releases.value.length === 0) {
    await fetchReleases();
  }
}

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
  title: "CloudySky",
  description: "Official Solar Network Android push notification companion app.",
});

useSeoMeta({
  description: () => t("cloudySky.tagline"),
});

defineOgImage("UniOgImage", {
  title: "CloudySky",
  description: () => t("cloudySky.tagline"),
  iconImage: "/images/cloudy-sky/icon.png",
  backgroundImage: "/images/cloudy-sky/main-visual.svg",
});
</script>

<template>
  <div class="cloudy-sky-page">
    <!-- Hero -->
    <section
      class="relative min-h-[60vh] flex items-end overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <NuxtImg
        src="/images/cloudy-sky/main-visual.svg"
        class="absolute inset-0 w-full h-full object-cover object-center -z-10 opacity-70"
        width="1920"
        height="1080"
        loading="eager"
        fetchpriority="high"
        format="webp"
        alt=""
        style="view-transition-name: product-hero-cloudy-sky"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/50 to-transparent dark:via-base-100/55"
      />

      <div class="relative container mx-auto px-4 pb-14 pt-40">
        <div class="hero-rise max-w-2xl">
          <NuxtImg
            src="/images/cloudy-sky/icon.png"
            class="w-14 h-14 rounded-2xl shadow-lg mb-5"
            alt="CloudySky"
            width="56"
            height="56"
            format="webp"
            loading="eager"
            decoding="async"
          />
          <p class="eyebrow mb-3">
            Android &middot; {{ t("cloudySky.openSource") }}
          </p>
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            CloudySky
          </h1>
          <p class="mt-3 text-base sm:text-lg opacity-75 leading-relaxed max-w-xl">
            {{ t("cloudySky.tagline") }}
          </p>
          <p class="mt-5 font-mono text-sm opacity-70" aria-hidden="true">
            <span class="text-primary">⇅</span> sse://push.solian.app
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-3">
            <a
              v-if="latest?.downloadUrl"
              :href="latest.downloadUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary btn-md rounded-full px-6 gap-2"
            >
              <IconsIconAndroid class="w-4 h-4 fill-current" />
              {{ t("cloudySky.downloadApk") }}
            </a>
            <a
              href="https://github.com/Solsynth/CloudySky"
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
        <p class="eyebrow mb-3">{{ t("cloudySky.about.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("cloudySky.about.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("cloudySky.about.desc") }}
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
        <p class="eyebrow mb-3">{{ t("cloudySky.features.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("cloudySky.features.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("cloudySky.features.desc") }}
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

    <!-- Requirements -->
    <section class="container mx-auto px-4 pb-24">
      <div class="max-w-2xl">
        <p class="eyebrow mb-3">{{ t("cloudySky.requirements.title") }}</p>
      </div>
      <ul class="mt-8 grid sm:grid-cols-3 gap-x-10">
        <li class="flex items-start gap-3 py-4 border-t border-base-content/10">
          <CheckCircle class="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div>
            <p class="font-medium text-sm">
              {{ t("cloudySky.requirements.android.title") }}
            </p>
            <p class="text-sm opacity-55 leading-relaxed">
              {{ t("cloudySky.requirements.android.desc") }}
            </p>
          </div>
        </li>
        <li class="flex items-start gap-3 py-4 border-t border-base-content/10">
          <CheckCircle class="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div>
            <p class="font-medium text-sm">
              {{ t("cloudySky.requirements.account.title") }}
            </p>
            <p class="text-sm opacity-55 leading-relaxed">
              {{ t("cloudySky.requirements.account.desc") }}
            </p>
          </div>
        </li>
        <li class="flex items-start gap-3 py-4 border-t border-base-content/10">
          <CheckCircle class="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div>
            <p class="font-medium text-sm">
              {{ t("cloudySky.requirements.battery.title") }}
            </p>
            <p class="text-sm opacity-55 leading-relaxed">
              {{ t("cloudySky.requirements.battery.desc") }}
            </p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Releases -->
    <section
      v-if="latest || !releasesLoading"
      id="releases"
      class="container mx-auto px-4 pb-24 scroll-mt-24"
    >
      <div class="flex items-end justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <History class="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
          <h2 class="text-3xl font-semibold tracking-tight">
            {{ t("releases.title") }}
          </h2>
        </div>
        <button
          v-if="releases.length > 1"
          type="button"
          class="btn btn-sm btn-ghost gap-1 shrink-0"
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

      <div
        v-if="showAllReleases && releasesLoading"
        class="py-4 text-center opacity-60"
      >
        {{ t("releases.loading") }}
      </div>

      <ReleaseTimeline
        v-else-if="showAllReleases && releases.length > 0"
        :releases="releases"
      />

      <div v-if="!latest && !releasesLoading" class="py-4">
        <p class="opacity-60">{{ t("releases.noReleases") }}</p>
      </div>
    </section>

    <!-- Reviews -->
    <section class="container mx-auto px-4 pb-24">
      <div class="max-w-xl mb-12">
        <p class="eyebrow mb-3">{{ t("reviews.title") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("reviews.shareExperience") }}
        </h2>
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
            {{ t("cloudySky.help.title") }}
          </h2>
          <p class="mt-1.5 opacity-60">{{ t("cloudySky.help.desc") }}</p>
        </div>
        <a
          href="https://github.com/Solsynth/CloudySky/issues"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-outline btn-md rounded-full gap-2 shrink-0"
        >
          <Bug class="w-4 h-4" />
          {{ t("royIcpFilling.help.reportIssue") }}
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cloudy-sky-page {
  --color-primary: oklch(58% 0.09 245deg);
  --color-primary-content: oklch(96% 0.02 245deg);
}

::global([data-theme="dark"]) .cloudy-sky-page {
  --color-primary: oklch(74% 0.09 245deg);
  --color-primary-content: oklch(16% 0.03 245deg);
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
</style>
