<script setup lang="ts">
import {
  Bell,
  Shield,
  Smartphone,
  Zap,
  Bug,
  CodeXml,
  Heart,
  MessageSquare,
  Star,
  StarHalf,
  BookOpen,
  Download,
  Tag,
  Folder,
  History,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Wifi,
  WifiOff,
  RefreshCw,
} from "@lucide/vue";
import IconsIconAndroid from "~/components/Icons/IconAndroid.vue";
import ReleaseCard from "~/components/ReleaseCard.vue";
import ReleaseTimeline from "~/components/ReleaseTimeline.vue";
import ReviewSummary from "~/components/ReviewSummary.vue";
import ReviewForm from "~/components/ReviewForm.vue";
import ReviewList from "~/components/ReviewList.vue";
import { useProductReleases } from "~/composables/useProductReleases";
import { useProductReviews } from "~/composables/useProductReviews";
import { useProductReviewSubmission } from "~/composables/useProductReviewSubmission";

const { t, locale } = useI18n();

const PRODUCT_SLUG = "cloudy-sky";
const GITHUB_REPO = "Solsynth/CloudySky";

const { data: githubRelease } = await useFetch(
  `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
  {
    transform: (data: {
      tag_name?: string;
      html_url?: string;
      assets?: { name: string; browser_download_url: string }[];
    } | null) => {
      if (!data) return null;
      const apk = data.assets?.find((a) => a.name.endsWith(".apk"));
      return {
        tag: data.tag_name,
        url: data.html_url,
        downloadUrl: apk?.browser_download_url || null,
      };
    },
  },
);

const aboutCards = [
  {
    icon: Bell,
    bg: "bg-primary/20",
    iconClass: "text-primary",
    titleKey: "cloudySky.aboutCard.notifications.title",
    descKey: "cloudySky.aboutCard.notifications.desc",
  },
  {
    icon: Shield,
    bg: "bg-secondary/20",
    iconClass: "text-secondary",
    titleKey: "cloudySky.aboutCard.secure.title",
    descKey: "cloudySky.aboutCard.secure.desc",
  },
  {
    icon: Zap,
    bg: "bg-accent/20",
    iconClass: "text-accent",
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
      class="relative h-[60vh] min-h-100 overflow-hidden -mt-(--site-page-offset,64px)"
    >
      <img
        src="/images/cloudy-sky/main-visual.svg"
        class="absolute inset-0 w-full h-full object-cover object-center -z-10 opacity-70"
        loading="eager"
        alt=""
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/30 to-transparent"
      />

      <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
        <div
          class="container mx-auto flex flex-col md:flex-row md:items-end gap-4 md:gap-6"
        >
          <div class="flex items-center gap-4 min-w-0">
            <img
              src="/images/cloudy-sky/icon.png"
              class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl shrink-0"
              alt="CloudySky"
              width="96"
              height="96"
            />
            <div class="min-w-0">
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-1">
                CloudySky
              </h1>
              <p class="text-base sm:text-lg opacity-80 line-clamp-2">
                {{ t("cloudySky.tagline") }}
              </p>
              <div class="flex items-center gap-2 mt-3">
                <span class="badge badge-primary badge-sm">
                  <IconsIconAndroid class="w-3.5 h-3.5 fill-current" />
                  Android
                </span>
                <span class="badge badge-ghost badge-sm">
                  {{ t("cloudySky.openSource") }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 md:ml-auto md:shrink-0">
            <a
              :href="githubRelease?.downloadUrl ?? 'https://fs.solsynth.dev/d/r2/cloudysky/app-release.apk'"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary btn-sm sm:btn-md md:btn-lg rounded-full gap-2"
            >
              <IconsIconAndroid class="w-4 h-4 fill-current" />
              {{ t("cloudySky.downloadApk") }}
            </a>
            <a
              href="https://github.com/Solsynth/CloudySky"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline btn-sm sm:btn-md md:btn-lg rounded-full gap-2"
            >
              <CodeXml class="w-4 h-4" />
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
          t("cloudySky.about.badge")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("cloudySky.about.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-3xl mx-auto">
          {{ t("cloudySky.about.desc") }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="card in aboutCards"
          :key="card.titleKey"
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 p-8 border border-base-content/5"
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
          t("cloudySky.features.badge")
        }}</span>
        <h2 class="text-4xl font-bold mb-4">
          {{ t("cloudySky.features.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-2xl mx-auto">
          {{ t("cloudySky.features.desc") }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="feature in features"
          :key="feature.key"
          class="card bg-base-200 rounded-2xl border border-base-content/5 p-6 hover:shadow-lg transition-shadow"
        >
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
          >
            <component
              :is="feature.icon"
              class="w-5 h-5 text-primary"
            />
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

    <!-- Requirements -->
    <section class="container mx-auto px-4 py-16">
      <div class="card bg-base-200 border border-base-content/5 p-8 max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-center">
          {{ t("cloudySky.requirements.title") }}
        </h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <CheckCircle class="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p class="font-medium">
                {{ t("cloudySky.requirements.android.title") }}
              </p>
              <p class="text-sm opacity-60">
                {{ t("cloudySky.requirements.android.desc") }}
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <CheckCircle class="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p class="font-medium">
                {{ t("cloudySky.requirements.account.title") }}
              </p>
              <p class="text-sm opacity-60">
                {{ t("cloudySky.requirements.account.desc") }}
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <CheckCircle class="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p class="font-medium">
                {{ t("cloudySky.requirements.battery.title") }}
              </p>
              <p class="text-sm opacity-60">
                {{ t("cloudySky.requirements.battery.desc") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="divider" />

    <!-- Releases Section -->
    <section
      v-if="latest || !releasesLoading"
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

      <div v-if="!latest && !releasesLoading" class="text-center py-4">
        <p class="opacity-60">{{ t("releases.noReleases") }}</p>
      </div>
    </section>

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
              {{ t("cloudySky.help.title") }}
            </h2>
            <p class="text-lg opacity-80">
              {{ t("cloudySky.help.desc") }}
            </p>
          </div>
          <div class="flex flex-wrap gap-4 justify-center">
            <a
              href="https://github.com/Solsynth/CloudySky/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline btn-lg"
            >
              <Bug class="w-5 h-5" />
              {{ t("royIcpFilling.help.reportIssue") }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cloudy-sky-page {
  --color-primary: oklch(60% 0.12 245deg);
  --color-primary-content: oklch(95% 0.02 245deg);
}

:global([data-theme="dark"]) .cloudy-sky-page {
  --color-primary: oklch(75% 0.1 245deg);
  --color-primary-content: oklch(95% 0.02 245deg);
}
</style>
