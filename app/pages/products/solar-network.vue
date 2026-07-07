<script setup lang="ts">
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
} from "@lucide/vue";
import { ref, onMounted } from "vue";
import ReleaseCard from "~/components/ReleaseCard.vue";
import ReleaseTimeline from "~/components/ReleaseTimeline.vue";
import ReviewSummary from "~/components/ReviewSummary.vue";
import ReviewForm from "~/components/ReviewForm.vue";
import ReviewList from "~/components/ReviewList.vue";
import { useProductReleases } from "~/composables/useProductReleases";
import { useProductReviews } from "~/composables/useProductReviews";
import { useProductReviewSubmission } from "~/composables/useProductReviewSubmission";

const { t, locale } = useI18n();

const PRODUCT_SLUG = "solar-network";
const activePlatform = ref("web");
const copied = ref(false);

const { data: latestRelease } = await useFetch("/api/github-release", {
  transform: (data: any) => {
    if (!data) return null;
    return {
      tag: data.tag,
      name: data.name,
      body: data.body,
      url: data.url,
      date: new Date(data.date).toLocaleDateString(
        locale.value === "zh" ? "zh-CN" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      ),
    };
  },
});

function copyCommand() {
  navigator.clipboard.writeText("brew install --cask solsynth/solian/solian");
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

// ==================== Releases ====================
const {
  releases,
  latest,
  loading: releasesLoading,
  fetchReleases,
  fetchLatest,
} = useProductReleases(PRODUCT_SLUG);
const showAllReleases = ref(false);
onMounted(async () => {
  await Promise.all([fetchLatest(), fetchReleases()]);
});

// ==================== Reviews ====================
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
  await fetchMyReview();
  await refreshReviews();
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
      ></div>

      <div class="absolute bottom-0 left-0 right-0 p-8">
        <div
          class="container mx-auto flex flex-col md:flex-row items-end gap-6"
        >
          <img
            src="/images/solar-network/icon.png"
            class="w-28 h-28 rounded-2xl shadow-2xl"
            alt="Solar Network"
          />
          <div class="flex-1">
            <h1 class="text-4xl md:text-5xl font-bold mb-2">
              Solar Network
            </h1>
            <p class="text-xl opacity-90 mb-4">
              {{ t("solarNetwork.tagline") }}
            </p>
          </div>
          <div class="flex gap-3 flex-wrap">
            <a
              href="https://web.solian.app"
              target="_blank"
              class="btn btn-primary btn-lg rounded-full transition-all"
            >
              <Sparkles class="w-5 h-5" />
              {{ t("solarNetwork.getStarted") }}
            </a>
            <a
              href="#download"
              class="btn btn-accent btn-lg rounded-full"
            >
              <ExternalLink class="w-5 h-5" />
              {{ t("solarNetwork.download.btn") }}
            </a>
            <a
              href="https://github.com/Solsynth/Solian"
              target="_blank"
              class="btn btn-outline btn-lg rounded-full transition-all"
            >
              <CodeXml class="w-5 h-5" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="divider mt-0 height-[1px]"></div>

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
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 p-8 border border-base-content/5"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4"
          >
            <Heart class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-xl font-bold mb-2">
            {{ t("solarNetwork.aboutCard.peaceful.title") }}
          </h3>
          <p class="opacity-80">
            {{ t("solarNetwork.aboutCard.peaceful.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 p-8 border border-base-content/5"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4"
          >
            <Code class="w-8 h-8 text-secondary" />
          </div>
          <h3 class="text-xl font-bold mb-2">
            {{ t("solarNetwork.aboutCard.developer.title") }}
          </h3>
          <p class="opacity-80">
            {{ t("solarNetwork.aboutCard.developer.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 p-8 border border-base-content/5"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4"
          >
            <Zap class="w-8 h-8 text-accent" />
          </div>
          <h3 class="text-xl font-bold mb-2">
            {{ t("solarNetwork.aboutCard.open.title") }}
          </h3>
          <p class="opacity-80">{{ t("solarNetwork.aboutCard.open.desc") }}</p>
        </div>
      </div>
    </section>

    <div class="divider"></div>

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

      <!-- Featured: Timeline -->
      <div class="card bg-base-200 overflow-hidden mb-8">
        <div class="grid md:grid-cols-2 gap-0">
          <div class="p-8 md:p-10 flex flex-col justify-center">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <MessageSquare class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-primary">
                {{ t("solarNetwork.features.timeline.title") }}
              </h3>
            </div>
            <p class="opacity-80 leading-relaxed">
              {{ t("solarNetwork.features.timeline.desc") }}
            </p>
          </div>
          <div class="bg-base-300 flex items-center justify-center p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/explore.webp"
              class="rounded-xl shadow-md w-full max-w-md"
              alt="Timeline"
            />
          </div>
        </div>
      </div>

      <!-- Featured: Chat -->
      <div class="card bg-base-200 overflow-hidden mb-8">
        <div class="grid md:grid-cols-2 gap-0">
          <div
            class="bg-base-300 flex items-center justify-center p-4 md:order-1 order-2"
          >
            <NuxtImg
              src="/images/solar-network/screenshots/chat.webp"
              class="rounded-xl shadow-md w-full max-w-md"
              alt="Chat"
            />
          </div>
          <div
            class="p-8 md:p-10 flex flex-col justify-center md:order-2 order-1"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <MessageSquare class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-primary">
                {{ t("solarNetwork.features.chat.title") }}
              </h3>
            </div>
            <p class="opacity-80 leading-relaxed">
              {{ t("solarNetwork.features.chat.desc") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Featured: Realms -->
      <div class="card bg-base-200 overflow-hidden mb-8">
        <div class="grid md:grid-cols-2 gap-0">
          <div class="p-8 md:p-10 flex flex-col justify-center">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <Users class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-primary">
                {{ t("solarNetwork.features.realms.title") }}
              </h3>
            </div>
            <p class="opacity-80 leading-relaxed">
              {{ t("solarNetwork.features.realms.desc") }}
            </p>
          </div>
          <div class="bg-base-300 flex items-center justify-center p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/realms.webp"
              class="rounded-xl shadow-md w-full max-w-md"
              alt="Realms"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- Reactions -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/post-reactions.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Reactions"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <SmilePlus class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.reactions.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.reactions.desc") }}
            </p>
          </div>
        </div>

        <!-- Collections -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/post-collections.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Collections"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Folder class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.collections.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.collections.desc") }}
            </p>
          </div>
        </div>

        <!-- Wallet -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/wallet.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Wallet"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.wallet.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.wallet.desc") }}
            </p>
          </div>
        </div>

        <!-- Stickers -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/stickers.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Stickers"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sticker class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.stickers.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.stickers.desc") }}
            </p>
          </div>
        </div>

        <!-- Drive -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/drive.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Drive"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Image class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.files.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.files.desc") }}
            </p>
          </div>
        </div>

        <!-- Achievements -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/badges.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Achievements"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.achievements.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.achievements.desc") }}
            </p>
          </div>
        </div>

        <!-- Polls -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/surveys.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Polls"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.polls.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.polls.desc") }}
            </p>
          </div>
        </div>

        <!-- Dashboard -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/dashboard.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Dashboard"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Monitor class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.dashboard.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.dashboard.desc") }}
            </p>
          </div>
        </div>

        <!-- Events -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/events.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Events"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.events.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.events.desc") }}
            </p>
          </div>
        </div>

        <!-- Event Calendar -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/event-calendar.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Event Calendar"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.eventCalendar.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.eventCalendar.desc") }}
            </p>
          </div>
        </div>

        <!-- Presences -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/profile-presences.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Profile Presences"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.presences.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.presences.desc") }}
            </p>
          </div>
        </div>

        <!-- Developer Hub -->
        <div class="card bg-base-200 overflow-hidden rounded-2xl border border-base-content/5">
          <div class="bg-base-300 p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/developer-hub.webp"
              class="rounded-lg w-full aspect-[4/3] object-cover"
              alt="Developer Hub"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2.5 mb-2">
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Code class="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 class="text-sm font-semibold">
                {{ t("solarNetwork.features.developerHub.title") }}
              </h3>
            </div>
            <p class="text-xs opacity-60 leading-relaxed">
              {{ t("solarNetwork.features.developerHub.desc") }}
            </p>
          </div>
        </div>

        <!-- Social -->
        <div class="card bg-base-200 rounded-2xl border border-base-content/5 p-5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Users class="w-[18px] h-[18px] text-primary" />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t("solarNetwork.features.social.title") }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t("solarNetwork.features.social.desc") }}
          </p>
        </div>

        <!-- Countdown -->
        <div class="card bg-base-200 rounded-2xl border border-base-content/5 p-5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Calendar class="w-[18px] h-[18px] text-primary" />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t("solarNetwork.features.countdown.title") }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t("solarNetwork.features.countdown.desc") }}
          </p>
        </div>

        <!-- OAuth -->
        <div class="card bg-base-200 rounded-2xl border border-base-content/5 p-5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Shield class="w-[18px] h-[18px] text-primary" />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t("solarNetwork.features.oauth.title") }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t("solarNetwork.features.oauth.desc") }}
          </p>
        </div>

        <!-- Check-in -->
        <div class="card bg-base-200 rounded-2xl border border-base-content/5 p-5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Bell class="w-[18px] h-[18px] text-primary" />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t("solarNetwork.features.checkin.title") }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t("solarNetwork.features.checkin.desc") }}
          </p>
        </div>

        <!-- RSS -->
        <div class="card bg-base-200 rounded-2xl border border-base-content/5 p-5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Rss class="w-[18px] h-[18px] text-primary" />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t("solarNetwork.features.rss.title") }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t("solarNetwork.features.rss.desc") }}
          </p>
        </div>

        <!-- Editor -->
        <div class="card bg-base-200 rounded-2xl border border-base-content/5 p-5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <FileText class="w-[18px] h-[18px] text-primary" />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t("solarNetwork.features.editor.title") }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t("solarNetwork.features.editor.desc") }}
          </p>
        </div>

        <!-- Fediverse -->
        <div class="card bg-base-200 rounded-2xl border border-base-content/5 p-5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Globe class="w-[18px] h-[18px] text-primary" />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t("solarNetwork.features.fediverse.title") }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t("solarNetwork.features.fediverse.desc") }}
          </p>
        </div>

        <!-- Gallery -->
        <div class="card bg-base-200 rounded-2xl border border-base-content/5 p-5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Image class="w-[18px] h-[18px] text-primary" />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t("solarNetwork.features.gallery.title") }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t("solarNetwork.features.gallery.desc") }}
          </p>
        </div>

        <!-- Subscription -->
        <div class="card bg-base-200 rounded-2xl border border-base-content/5 p-5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <CreditCard class="w-[18px] h-[18px] text-primary" />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t("solarNetwork.features.subscription.title") }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t("solarNetwork.features.subscription.desc") }}
          </p>
        </div>

        <!-- More -->
        <div class="card bg-base-200 rounded-2xl border border-base-content/5 p-5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Sparkles class="w-[18px] h-[18px] text-primary" />
          </div>
          <h3 class="text-sm font-semibold mb-1">
            {{ t("solarNetwork.features.more.title") }}
          </h3>
          <p class="text-xs opacity-60 leading-relaxed">
            {{ t("solarNetwork.features.more.desc") }}
          </p>
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <!-- Releases Section -->
    <section v-if="releases.length > 0" class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <History class="w-5 h-5 text-primary" />
          {{ t("releases.title") }}
        </h2>
        <button
          v-if="releases.length > 1"
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
      <div class="card bg-base-200 p-8 md:p-12 rounded-3xl">
        <!-- Latest Release -->
        <div v-if="latestRelease" class="mb-8 bg-base-300 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <span class="badge badge-primary">{{ latestRelease.tag }}</span>
              <span class="text-sm opacity-60">{{ latestRelease.date }}</span>
            </div>
            <a
              :href="latestRelease.url"
              target="_blank"
              class="btn btn-ghost btn-sm gap-2"
            >
              <ExternalLink class="w-4 h-4" />
              {{ t("solarNetwork.download.release.viewOnGithub") }}
            </a>
          </div>
          <h3 v-if="latestRelease.name" class="font-bold text-lg mb-3">
            {{ latestRelease.name }}
          </h3>
          <div
            v-if="latestRelease.body"
            class="prose prose-sm max-w-none opacity-80 whitespace-pre-wrap"
          >
            {{ latestRelease.body }}
          </div>
        </div>

        <div class="grid md:grid-cols-[200px_1fr] gap-6">
          <!-- Platform selector -->
          <div
            class="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0"
          >
            <label
              class="btn btn-ghost justify-start gap-3 cursor-pointer"
              :class="{ 'btn-active': activePlatform === 'web' }"
            >
              <input
                type="radio"
                name="platform"
                value="web"
                v-model="activePlatform"
                class="hidden"
              />
              <Globe class="w-5 h-5 shrink-0" />
              <span class="hidden md:inline">Web</span>
            </label>
            <label
              class="btn btn-ghost justify-start gap-3 cursor-pointer"
              :class="{ 'btn-active': activePlatform === 'ios' }"
            >
              <input
                type="radio"
                name="platform"
                value="ios"
                v-model="activePlatform"
                class="hidden"
              />
              <IconsIconIos class="w-5 h-5 shrink-0 fill-current" />
              <span class="hidden md:inline">iOS</span>
            </label>
            <label
              class="btn btn-ghost justify-start gap-3 cursor-pointer"
              :class="{ 'btn-active': activePlatform === 'android' }"
            >
              <input
                type="radio"
                name="platform"
                value="android"
                v-model="activePlatform"
                class="hidden"
              />
              <IconsIconAndroid class="w-5 h-5 shrink-0 fill-current" />
              <span class="hidden md:inline">Android</span>
            </label>
            <label
              class="btn btn-ghost justify-start gap-3 cursor-pointer"
              :class="{ 'btn-active': activePlatform === 'macos' }"
            >
              <input
                type="radio"
                name="platform"
                value="macos"
                v-model="activePlatform"
                class="hidden"
              />
              <IconsIconMacos class="w-5 h-5 shrink-0 fill-current" />
              <span class="hidden md:inline">macOS</span>
            </label>
            <label
              class="btn btn-ghost justify-start gap-3 cursor-pointer"
              :class="{ 'btn-active': activePlatform === 'windows' }"
            >
              <input
                type="radio"
                name="platform"
                value="windows"
                v-model="activePlatform"
                class="hidden"
              />
              <Monitor class="w-5 h-5 shrink-0" />
              <span class="hidden md:inline">Windows</span>
            </label>
            <label
              class="btn btn-ghost justify-start gap-3 cursor-pointer"
              :class="{ 'btn-active': activePlatform === 'linux' }"
            >
              <input
                type="radio"
                name="platform"
                value="linux"
                v-model="activePlatform"
                class="hidden"
              />
              <IconsIconLinux class="w-5 h-5 shrink-0 fill-current" />
              <span class="hidden md:inline">Linux</span>
            </label>
          </div>

          <!-- Platform content -->
          <div class="bg-base-100 rounded-2xl p-6 md:p-8 min-h-[280px]">
            <!-- Web -->
            <div v-if="activePlatform === 'web'">
              <div class="flex items-center gap-3 mb-4">
                <Globe class="w-8 h-8 text-primary" />
                <h3 class="text-2xl font-bold">
                  {{ t("solarNetwork.download.web.title") }}
                </h3>
              </div>
              <p class="opacity-70 mb-6">
                {{ t("solarNetwork.download.web.desc") }}
              </p>
              <a
                href="https://web.solian.app"
                target="_blank"
                class="btn btn-primary rounded-full transition-all"
              >
                <ExternalLink class="w-5 h-5" />
                {{ t("solarNetwork.journey.openBrowser") }}
              </a>
            </div>

            <!-- iOS -->
            <div v-if="activePlatform === 'ios'">
              <div class="flex items-center gap-3 mb-4">
                <IconsIconIos class="w-8 h-8 text-primary fill-primary" />
                <h3 class="text-2xl font-bold">
                  {{ t("solarNetwork.download.ios.title") }}
                </h3>
              </div>
              <p class="opacity-70 mb-6">
                {{ t("solarNetwork.download.ios.desc") }}
              </p>
              <a
                href="https://testflight.apple.com/join/YJ0lmN6O"
                target="_blank"
                class="btn btn-primary rounded-full transition-all"
              >
                <IconsIconIos class="w-5 h-5 fill-current" />
                {{ t("solarNetwork.download.ios.testflight") }}
              </a>
            </div>

            <!-- Android -->
            <div v-if="activePlatform === 'android'">
              <div class="flex items-center gap-3 mb-4">
                <IconsIconAndroid class="w-8 h-8 text-primary fill-primary" />
                <h3 class="text-2xl font-bold">
                  {{ t("solarNetwork.download.android.title") }}
                </h3>
              </div>
              <p class="opacity-70 mb-6">
                {{ t("solarNetwork.download.android.desc") }}
              </p>
              <div class="flex flex-col gap-3">
                <a
                  href="https://fs.solsynth.dev/d/public/r2/solian/app-arm64-v8a-release.apk"
                  target="_blank"
                  class="btn btn-primary rounded-full transition-all"
                >
                  <IconsIconAndroid class="w-5 h-5 fill-current" />
                  ARM64 (arm64-v8a)
                </a>
                <a
                  href="https://fs.solsynth.dev/d/public/r2/solian/app-armeabi-v7a-release.apk"
                  target="_blank"
                  class="btn btn-outline rounded-full"
                >
                  <IconsIconAndroid class="w-5 h-5 fill-current" />
                  ARMv7 (armeabi-v7a)
                </a>
                <a
                  href="https://fs.solsynth.dev/d/public/r2/solian/app-x86_64-release.apk"
                  target="_blank"
                  class="btn btn-outline rounded-full"
                >
                  <IconsIconAndroid class="w-5 h-5 fill-current" />
                  x86_64
                </a>
                <a
                  href="https://github.com/Solsynth/Solian/releases"
                  target="_blank"
                  class="btn btn-ghost rounded-full"
                >
                  <CodeXml class="w-5 h-5" />
                  {{ t("solarNetwork.download.github") }}
                </a>
              </div>
            </div>

            <!-- macOS -->
            <div v-if="activePlatform === 'macos'">
              <div class="flex items-center gap-3 mb-4">
                <IconsIconMacos class="w-8 h-8 text-primary fill-primary" />
                <h3 class="text-2xl font-bold">
                  {{ t("solarNetwork.download.macos.title") }}
                </h3>
              </div>
              <p class="opacity-70 mb-6">
                {{ t("solarNetwork.download.macos.desc") }}
              </p>

              <div class="mb-6">
                <p class="text-sm font-medium mb-2">Homebrew</p>
                <div class="bg-base-300 rounded-xl p-4 flex items-center gap-3">
                  <code class="flex-1 text-sm font-mono"
                    >brew install --cask solsynth/solian/solian</code
                  >
                  <button
                    class="btn btn-ghost btn-sm btn-square"
                    @click="copyCommand"
                  >
                    <Check v-if="copied" class="w-4 h-4 text-success" />
                    <Copy v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <a
                  href="https://fs.solsynth.dev/d/public/r2/solian/solian-macos.tar.gz"
                  target="_blank"
                  class="btn btn-primary rounded-full transition-all"
                >
                  <ExternalLink class="w-5 h-5" />
                  {{ t("solarNetwork.download.direct") }}
                </a>
              </div>
            </div>

            <!-- Windows -->
            <div v-if="activePlatform === 'windows'">
              <div class="flex items-center gap-3 mb-4">
                <Monitor class="w-8 h-8 text-primary" />
                <h3 class="text-2xl font-bold">
                  {{ t("solarNetwork.download.windows.title") }}
                </h3>
              </div>
              <p class="opacity-70 mb-6">
                {{ t("solarNetwork.download.windows.desc") }}
              </p>
              <div class="flex flex-wrap gap-3">
                <a
                  href="https://fs.solsynth.dev/d/public/r2/solian/build-output-windows-installer.zip"
                  target="_blank"
                  class="btn btn-primary rounded-full transition-all"
                >
                  <ExternalLink class="w-5 h-5" />
                  {{ t("solarNetwork.download.direct") }}
                </a>
                <a
                  href="https://github.com/Solsynth/Solian/releases"
                  target="_blank"
                  class="btn btn-outline rounded-full"
                >
                  <CodeXml class="w-5 h-5" />
                  {{ t("solarNetwork.download.github") }}
                </a>
              </div>
            </div>

            <!-- Linux -->
            <div v-if="activePlatform === 'linux'">
              <div class="flex items-center gap-3 mb-4">
                <IconsIconLinux class="w-8 h-8 text-primary fill-primary" />
                <h3 class="text-2xl font-bold">
                  {{ t("solarNetwork.download.linux.title") }}
                </h3>
              </div>
              <p class="opacity-70 mb-6">
                {{ t("solarNetwork.download.linux.desc") }}
              </p>
              <div class="flex flex-wrap gap-3">
                <a
                  href="https://fs.solsynth.dev/d/public/r2/solian/build-output-linux-appimage.zip"
                  target="_blank"
                  class="btn btn-primary rounded-full transition-all"
                >
                  <ExternalLink class="w-5 h-5" />
                  {{ t("solarNetwork.download.direct") }}
                </a>
                <a
                  href="https://github.com/Solsynth/Solian/releases"
                  target="_blank"
                  class="btn btn-outline rounded-full"
                >
                  <CodeXml class="w-5 h-5" />
                  {{ t("solarNetwork.download.github") }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-6">
          <a
            href="https://github.com/Solsynth/Solian"
            target="_blank"
            class="btn btn-ghost gap-2"
          >
            <CodeXml class="w-4 h-4" />
            {{ t("solarNetwork.journey.viewGithub") }}
          </a>
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <!-- Reviews Section -->
    <section class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <MessageSquare class="w-5 h-5 text-primary" />
          {{ t("reviews.title") }}
        </h2>
      </div>

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
        class="mb-6"
      />

      <div v-if="!myReviewLoading" class="mb-6">
        <ReviewForm
          v-model="reviewForm"
          v-model:open="reviewFormOpen"
          :submitting="submitting"
          :existing-review="!!myReview"
          @submit="handleSubmitReview"
          @delete="handleDeleteReview"
        >
          <template #trigger>
            <span
              v-if="!myReview"
              class="btn btn-primary btn-sm gap-2"
              @click="openReviewForm"
            >
              <Star class="w-4 h-4" />
              {{ t("reviews.writeReview") }}
            </span>
            <span
              v-else
              class="btn btn-outline btn-sm gap-2"
              @click="openReviewForm"
            >
              <Star class="w-4 h-4" />
              {{ t("reviews.editReview") }}
            </span>
          </template>
        </ReviewForm>
      </div>

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
          <div class="flex gap-4">
            <a
              href="https://github.com/Solsynth/Solian/issues"
              target="_blank"
              class="btn btn-outline btn-lg"
            >
              <Bug class="w-5 h-5" />
              {{ t("solarNetwork.help.reportIssue") }}
            </a>
            <a
              href="https://github.com/Solsynth/Solian/discussions"
              target="_blank"
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

:deep(.dark) .solar-network-page {
  --color-primary: oklch(55% 0.08 275deg);
  --color-primary-content: oklch(95% 0.02 275deg);
}
</style>
