<script setup lang="ts">
import ProductDownloadSection from "~/components/ProductDownloadSection.vue";
import type { ProductDownloadPlatform } from "~/types/product-download";
import {
  Bell,
  BookOpen,
  Bug,
  Calendar,
  CheckCircle,
  Code,
  CodeXml,
  CreditCard,
  ExternalLink,
  FileText,
  Folder,
  Globe,
  Heart,
  Image,
  MessageSquare,
  Monitor,
  Rss,
  Shield,
  SmilePlus,
  Sparkles,
  Star,
  Sticker,
  Users,
  Wallet,
  Zap,
} from "@lucide/vue";
import IconsIconIos from "~/components/Icons/IconIos.vue";
import IconsIconAndroid from "~/components/Icons/IconAndroid.vue";
import IconsIconMacos from "~/components/Icons/IconMacos.vue";
import IconsIconLinux from "~/components/Icons/IconLinux.vue";
import ReviewSummary from "~/components/ReviewSummary.vue";
import ReviewForm from "~/components/ReviewForm.vue";
import ReviewList from "~/components/ReviewList.vue";
import StarRating from "~/components/StarRating.vue";

const { t, locale } = useI18n();

const PRODUCT_SLUG = "solar-network";
const docsUrl = computed(() =>
  locale.value === "zh"
    ? "https://kb.solsynth.dev/zh/solar-network/account/"
    : "https://kb.solsynth.dev/solar-network/account/",
);
const reviewFormOpen = ref(false);
const reviewForm = ref({
  rating: 0,
  title: "",
  content: "",
  isRecommended: null as boolean | null,
});

const { latest, loading: releasesLoading, fetchLatest } = useProductReleases(PRODUCT_SLUG);

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
    titleKey: "solarNetwork.aboutCard.peaceful.title",
    descKey: "solarNetwork.aboutCard.peaceful.desc",
  },
  {
    icon: Code,
    titleKey: "solarNetwork.aboutCard.developer.title",
    descKey: "solarNetwork.aboutCard.developer.desc",
  },
  {
    icon: Zap,
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
      class="relative min-h-[64vh] flex items-end overflow-hidden -mt-(--site-page-offset,64px)"
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
        style="view-transition-name: product-hero-solar-network"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/45 to-transparent dark:via-base-100/50"
      />

      <div class="relative container mx-auto px-4 pb-14 pt-44">
        <div class="hero-rise max-w-2xl">
          <NuxtImg
            src="/images/solar-network/icon.png"
            class="w-14 h-14 rounded-2xl shadow-lg mb-5"
            alt="Solar Network"
            width="56"
            height="56"
            format="webp"
            loading="eager"
            decoding="async"
          />
          <p class="eyebrow mb-3">Solian &middot; {{ t("solarNetwork.about.badge") }}</p>
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Solar Network
          </h1>
          <p class="mt-3 text-base sm:text-lg opacity-75 leading-relaxed max-w-xl">
            {{ t("solarNetwork.tagline") }}
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href="https://web.solian.app"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary btn-md rounded-full px-6 gap-2"
            >
              <Sparkles class="w-4 h-4" />
              {{ t("solarNetwork.getStarted") }}
            </a>
            <a
              href="#download"
              class="btn btn-ghost rounded-full px-5 gap-2"
            >
              <ExternalLink class="w-4 h-4" />
              {{ t("solarNetwork.download.btn") }}
            </a>
            <a
              :href="docsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-link px-0 gap-1.5 text-base-content opacity-70 hover:opacity-100"
            >
              <BookOpen class="w-4 h-4" />
              {{ t("solarNetwork.docs") }}
            </a>
            <a
              href="https://github.com/Solsynth/Solian"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-link px-0 gap-1.5 text-base-content opacity-70 hover:opacity-100"
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
        <p class="eyebrow mb-3">{{ t("solarNetwork.about.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("solarNetwork.about.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("solarNetwork.about.desc") }}
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
        <p class="eyebrow mb-3">{{ t("solarNetwork.features.badge") }}</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ t("solarNetwork.features.title") }}
        </h2>
        <p class="mt-4 opacity-70 leading-relaxed">
          {{ t("solarNetwork.features.desc") }}
        </p>
      </div>

      <!-- Signature: the three headline features threaded on a feed rail -->
      <ol class="relative mt-16 space-y-16 md:space-y-24">
        <span
          aria-hidden="true"
          class="absolute left-[7px] top-3 bottom-3 hidden md:block w-px bg-base-content/10"
        />
        <li
          v-for="feature in featuredFeatures"
          :key="feature.key"
          class="relative md:pl-12"
        >
          <span
            aria-hidden="true"
            class="absolute left-0 top-1.5 hidden md:block w-[15px] h-[15px] rounded-full border-2 border-primary bg-base-100"
          />
          <div class="grid items-center gap-8 md:grid-cols-2 md:gap-14">
            <div :class="feature.reverse ? 'md:order-2' : ''">
              <div class="flex items-center gap-3">
                <component
                  :is="feature.icon"
                  class="w-5 h-5 text-primary shrink-0"
                  aria-hidden="true"
                />
                <h3 class="text-xl sm:text-2xl font-semibold tracking-tight">
                  {{ t(`solarNetwork.features.${feature.key}.title`) }}
                </h3>
              </div>
              <p class="mt-3 opacity-65 leading-relaxed">
                {{ t(`solarNetwork.features.${feature.key}.desc`) }}
              </p>
            </div>
            <div :class="feature.reverse ? 'md:order-1' : ''">
              <NuxtImg
                :src="feature.image"
                class="rounded-xl w-full max-w-lg"
                :alt="feature.alt"
                width="640"
                height="480"
                sizes="sm:100vw md:50vw"
                loading="lazy"
                format="webp"
              />
            </div>
          </div>
        </li>
      </ol>

      <ul class="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
        <li
          v-for="feature in screenshotFeatures"
          :key="feature.key"
          class="pt-6 border-t border-base-content/10"
        >
          <NuxtImg
            :src="feature.image"
            class="rounded-lg w-full aspect-[4/3] object-cover mb-4"
            :alt="feature.alt"
            width="640"
            height="480"
            sizes="sm:100vw md:50vw lg:33vw"
            loading="lazy"
            format="webp"
          />
          <div class="flex items-center gap-2">
            <component
              :is="feature.icon"
              class="w-4 h-4 text-primary shrink-0"
              aria-hidden="true"
            />
            <h3 class="text-sm font-semibold">
              {{ t(`solarNetwork.features.${feature.key}.title`) }}
            </h3>
          </div>
          <p class="mt-1.5 text-sm opacity-55 leading-relaxed">
            {{ t(`solarNetwork.features.${feature.key}.desc`) }}
          </p>
        </li>
      </ul>

      <ul class="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
        <li
          v-for="feature in simpleFeatures"
          :key="feature.key"
          class="flex items-start gap-3.5 py-4 border-t border-base-content/10"
        >
          <component
            :is="feature.icon"
            class="w-[18px] h-[18px] mt-0.5 text-primary shrink-0"
            aria-hidden="true"
          />
          <div class="min-w-0">
            <h3 class="text-sm font-semibold">
              {{ t(`solarNetwork.features.${feature.key}.title`) }}
            </h3>
            <p class="mt-1 text-sm opacity-55 leading-relaxed">
              {{ t(`solarNetwork.features.${feature.key}.desc`) }}
            </p>
          </div>
        </li>
      </ul>
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

    <!-- Reviews -->
    <section class="container mx-auto px-4 py-24">
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
            {{ t("solarNetwork.help.title") }}
          </h2>
          <p class="mt-1.5 opacity-60">{{ t("solarNetwork.help.desc") }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <a
            :href="docsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline btn-md rounded-full gap-2"
          >
            <BookOpen class="w-4 h-4" />
            {{ t("solarNetwork.docs") }}
          </a>
          <a
            href="https://github.com/Solsynth/Solian/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-md rounded-full gap-2"
          >
            <Bug class="w-4 h-4" />
            {{ t("solarNetwork.help.reportIssue") }}
          </a>
          <a
            href="https://github.com/Solsynth/Solian/discussions"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-md rounded-full gap-2"
          >
            <MessageSquare class="w-4 h-4" />
            {{ t("solarNetwork.help.suggestion") }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.solar-network-page {
  --color-primary: oklch(62% 0.075 275deg);
  --color-primary-content: oklch(96% 0.02 275deg);
}

::global([data-theme="dark"]) .solar-network-page {
  --color-primary: oklch(72% 0.08 275deg);
  --color-primary-content: oklch(15% 0.03 275deg);
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
