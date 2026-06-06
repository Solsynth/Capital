<script setup lang="ts">
import {
  Github,
  ExternalLink,
  Bug,
  Tag,
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
  Smartphone,
  Monitor,
  Bell,
  Calendar,
  Wallet,
  Image,
  CheckCircle,
  Apple,
  Terminal,
  Copy,
  Check,
  SmilePlus,
} from "lucide-vue-next";

const { t, locale } = useI18n();
const localePath = useLocalePath();

const lang = computed(() => locale.value);

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

definePageMeta({
  title: "Solar Network",
  description: "",
});

useSeoMeta({
  description: () => t("solarNetwork.tagline"),
  ogImage: "/images/solar-network/main-visual.webp",
  twitterCard: "summary_large_image",
  twitterImage: "/images/solar-network/main-visual.webp",
});
</script>

<template>
  <div class="solar-network-page">
    <!-- Hero -->
    <section class="relative h-[70vh] min-h-120 overflow-hidden">
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
            src="/images/images/solar-network/icon.png"
            class="w-28 h-28 rounded-2xl shadow-2xl"
            alt="Solar Network"
          />
          <div class="flex-1">
            <h1 class="text-4xl md:text-5xl font-bold hero-glow mb-2">
              Solar Network
            </h1>
            <p class="text-xl opacity-90 mb-4 hero-glow">
              {{ t("solarNetwork.tagline") }}
            </p>
          </div>
          <div class="flex gap-3 flex-wrap">
            <a
              href="https://web.solian.app"
              target="_blank"
              class="btn btn-primary btn-lg rounded-full shadow-[0_0_20px_rgba(150,158,207,0.5)] hover:shadow-[0_0_30px_rgba(150,158,207,0.7)] hover:scale-105 transition-all"
            >
              <Sparkles class="w-5 h-5" />
              {{ t("solarNetwork.getStarted") }}
            </a>
            <a
              href="#download"
              class="btn btn-accent btn-lg rounded-full hover:scale-105 transition-transform"
            >
              <ExternalLink class="w-5 h-5" />
              {{ t("solarNetwork.download.btn") }}
            </a>
            <a
              href="https://github.com/Solsynth/Solian"
              target="_blank"
              class="btn btn-outline btn-lg rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
            >
              <Github class="w-5 h-5" />
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
        <h2 class="text-4xl font-bold mb-4 hero-glow">
          {{ t("solarNetwork.about.title") }}
        </h2>
        <p class="text-lg opacity-70 max-w-3xl mx-auto">
          {{ t("solarNetwork.about.desc") }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-8 shadow-lg hover:shadow-xl"
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
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-8 shadow-lg hover:shadow-xl"
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
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-8 shadow-lg hover:shadow-xl"
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
        <h2 class="text-4xl font-bold mb-4 hero-glow">
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
              class="rounded-xl shadow-lg w-full max-w-md"
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
              class="rounded-xl shadow-lg w-full max-w-md"
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
              class="rounded-xl shadow-lg w-full max-w-md"
              alt="Realms"
            />
          </div>
        </div>
      </div>

      <!-- Grid: Posts + Collections -->
      <div class="grid md:grid-cols-2 gap-8 mb-8">
        <div class="card bg-base-200 overflow-hidden">
          <div class="bg-base-300 flex items-center justify-center p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/post-reactions.webp"
              class="rounded-xl shadow-lg w-full"
              alt="Posts"
            />
          </div>
          <div class="p-6">
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <SmilePlus class="w-5 h-5 text-primary" />
              </div>
              <h3 class="text-lg font-bold text-primary">
                {{ t("solarNetwork.features.reactions.title") }}
              </h3>
            </div>
            <p class="opacity-80 text-sm">
              {{ t("solarNetwork.features.reactions.desc") }}
            </p>
          </div>
        </div>
        <div class="card bg-base-200 overflow-hidden">
          <div class="bg-base-300 flex items-center justify-center p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/post-collections.webp"
              class="rounded-xl shadow-lg w-full"
              alt="Post Collections"
            />
          </div>
          <div class="p-6">
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <Folder class="w-5 h-5 text-primary" />
              </div>
              <h3 class="text-lg font-bold text-primary">
                {{ t("solarNetwork.features.collections.title") }}
              </h3>
            </div>
            <p class="opacity-80 text-sm">
              {{ t("solarNetwork.features.collections.desc") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Grid: Wallet + Stickers + Drive -->
      <div class="grid md:grid-cols-3 gap-8 mb-8">
        <div class="card bg-base-200 overflow-hidden">
          <div class="bg-base-300 flex items-center justify-center p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/wallet.webp"
              class="rounded-xl shadow-lg w-full"
              alt="Wallet"
            />
          </div>
          <div class="p-6">
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <Wallet class="w-5 h-5 text-primary" />
              </div>
              <h3 class="text-lg font-bold text-primary">
                {{ t("solarNetwork.features.wallet.title") }}
              </h3>
            </div>
            <p class="opacity-80 text-sm">
              {{ t("solarNetwork.features.wallet.desc") }}
            </p>
          </div>
        </div>
        <div class="card bg-base-200 overflow-hidden">
          <div class="bg-base-300 flex items-center justify-center p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/stickers.webp"
              class="rounded-xl shadow-lg w-full"
              alt="Stickers"
            />
          </div>
          <div class="p-6">
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <Sticker class="w-5 h-5 text-primary" />
              </div>
              <h3 class="text-lg font-bold text-primary">
                {{ t("solarNetwork.features.stickers.title") }}
              </h3>
            </div>
            <p class="opacity-80 text-sm">
              {{ t("solarNetwork.features.stickers.desc") }}
            </p>
          </div>
        </div>
        <div class="card bg-base-200 overflow-hidden">
          <div class="bg-base-300 flex items-center justify-center p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/drive.webp"
              class="rounded-xl shadow-lg w-full"
              alt="Files"
            />
          </div>
          <div class="p-6">
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <Image class="w-5 h-5 text-primary" />
              </div>
              <h3 class="text-lg font-bold text-primary">
                {{ t("solarNetwork.features.files.title") }}
              </h3>
            </div>
            <p class="opacity-80 text-sm">
              {{ t("solarNetwork.features.files.desc") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Featured: Badges / Achievements -->
      <div class="card bg-base-200 overflow-hidden mb-8">
        <div class="grid md:grid-cols-2 gap-0">
          <div
            class="bg-base-300 flex items-center justify-center p-4 md:order-1 order-2"
          >
            <NuxtImg
              src="/images/solar-network/screenshots/badges.webp"
              class="rounded-xl shadow-lg w-full max-w-md"
              alt="Achievements"
            />
          </div>
          <div
            class="p-8 md:p-10 flex flex-col justify-center md:order-2 order-1"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <CheckCircle class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-primary">
                {{ t("solarNetwork.features.achievements.title") }}
              </h3>
            </div>
            <p class="opacity-80 leading-relaxed">
              {{ t("solarNetwork.features.achievements.desc") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Featured: Polls -->
      <div class="card bg-base-200 overflow-hidden mb-8">
        <div class="grid md:grid-cols-2 gap-0">
          <div class="p-8 md:p-10 flex flex-col justify-center">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <Calendar class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-primary">
                {{ t("solarNetwork.features.polls.title") }}
              </h3>
            </div>
            <p class="opacity-80 leading-relaxed">
              {{ t("solarNetwork.features.polls.desc") }}
            </p>
          </div>
          <div class="bg-base-300 flex items-center justify-center p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/polls.webp"
              class="rounded-xl shadow-lg w-full max-w-md"
              alt="Polls"
            />
          </div>
        </div>
      </div>

      <!-- Featured: Dashboard -->
      <div class="card bg-base-200 overflow-hidden mb-8">
        <div class="grid md:grid-cols-2 gap-0">
          <div class="p-8 md:p-10 flex flex-col justify-center">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <Monitor class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-primary">
                {{ t("solarNetwork.features.dashboard.title") }}
              </h3>
            </div>
            <p class="opacity-80 leading-relaxed">
              {{ t("solarNetwork.features.dashboard.desc") }}
            </p>
          </div>
          <div class="bg-base-300 flex items-center justify-center p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/dashboard.webp"
              class="rounded-xl shadow-lg w-full max-w-md"
              alt="Dashboard"
            />
          </div>
        </div>
      </div>

      <!-- Featured: Events -->
      <div class="card bg-base-200 overflow-hidden mb-8">
        <div class="grid md:grid-cols-2 gap-0">
          <div
            class="bg-base-300 flex items-center justify-center p-4 md:order-1 order-2"
          >
            <NuxtImg
              src="/images/solar-network/screenshots/events.webp"
              class="rounded-xl shadow-lg w-full max-w-md"
              alt="Events"
            />
          </div>
          <div
            class="p-8 md:p-10 flex flex-col justify-center md:order-2 order-1"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <Calendar class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-primary">
                {{ t("solarNetwork.features.events.title") }}
              </h3>
            </div>
            <p class="opacity-80 leading-relaxed">
              {{ t("solarNetwork.features.events.desc") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Featured: Event Calendar -->
      <div class="card bg-base-200 overflow-hidden mb-8">
        <div class="grid md:grid-cols-2 gap-0">
          <div class="p-8 md:p-10 flex flex-col justify-center">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <Calendar class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-primary">
                {{ t("solarNetwork.features.eventCalendar.title") }}
              </h3>
            </div>
            <p class="opacity-80 leading-relaxed">
              {{ t("solarNetwork.features.eventCalendar.desc") }}
            </p>
          </div>
          <div class="bg-base-300 flex items-center justify-center p-4">
            <NuxtImg
              src="/images/solar-network/screenshots/event-calendar.webp"
              class="rounded-xl shadow-lg w-full max-w-md"
              alt="Event Calendar"
            />
          </div>
        </div>
      </div>

      <!-- Featured: Profile Presences -->
      <div class="card bg-base-200 overflow-hidden mb-8">
        <div class="grid md:grid-cols-2 gap-0">
          <div
            class="bg-base-300 flex items-center justify-center p-4 md:order-1 order-2"
          >
            <NuxtImg
              src="/images/solar-network/screenshots/profile-presences.webp"
              class="rounded-xl shadow-lg w-full max-w-md"
              alt="Profile Presences"
            />
          </div>
          <div
            class="p-8 md:p-10 flex flex-col justify-center md:order-2 order-1"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <Sparkles class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-2xl font-bold text-primary">
                {{ t("solarNetwork.features.presences.title") }}
              </h3>
            </div>
            <p class="opacity-80 leading-relaxed">
              {{ t("solarNetwork.features.presences.desc") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Compact grid: remaining features -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-6 group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <Users class="w-5 h-5 text-primary" />
            </div>
            <h3 class="text-base font-bold text-primary">
              {{ t("solarNetwork.features.social.title") }}
            </h3>
          </div>
          <p class="opacity-80 text-sm">
            {{ t("solarNetwork.features.social.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-6 group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <Calendar class="w-5 h-5 text-primary" />
            </div>
            <h3 class="text-base font-bold text-primary">
              {{ t("solarNetwork.features.countdown.title") }}
            </h3>
          </div>
          <p class="opacity-80 text-sm">
            {{ t("solarNetwork.features.countdown.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-6 group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <Shield class="w-5 h-5 text-primary" />
            </div>
            <h3 class="text-base font-bold text-primary">
              {{ t("solarNetwork.features.oauth.title") }}
            </h3>
          </div>
          <p class="opacity-80 text-sm">
            {{ t("solarNetwork.features.oauth.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-6 group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <Bell class="w-5 h-5 text-primary" />
            </div>
            <h3 class="text-base font-bold text-primary">
              {{ t("solarNetwork.features.checkin.title") }}
            </h3>
          </div>
          <p class="opacity-80 text-sm">
            {{ t("solarNetwork.features.checkin.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-6 group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <Rss class="w-5 h-5 text-primary" />
            </div>
            <h3 class="text-base font-bold text-primary">
              {{ t("solarNetwork.features.rss.title") }}
            </h3>
          </div>
          <p class="opacity-80 text-sm">
            {{ t("solarNetwork.features.rss.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-6 group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <FileText class="w-5 h-5 text-primary" />
            </div>
            <h3 class="text-base font-bold text-primary">
              {{ t("solarNetwork.features.editor.title") }}
            </h3>
          </div>
          <p class="opacity-80 text-sm">
            {{ t("solarNetwork.features.editor.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-6 group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <Globe class="w-5 h-5 text-primary" />
            </div>
            <h3 class="text-base font-bold text-primary">
              {{ t("solarNetwork.features.fediverse.title") }}
            </h3>
          </div>
          <p class="opacity-80 text-sm">
            {{ t("solarNetwork.features.fediverse.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-6 group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <Image class="w-5 h-5 text-primary" />
            </div>
            <h3 class="text-base font-bold text-primary">
              {{ t("solarNetwork.features.gallery.title") }}
            </h3>
          </div>
          <p class="opacity-80 text-sm">
            {{ t("solarNetwork.features.gallery.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-6 group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <CreditCard class="w-5 h-5 text-primary" />
            </div>
            <h3 class="text-base font-bold text-primary">
              {{ t("solarNetwork.features.subscription.title") }}
            </h3>
          </div>
          <p class="opacity-80 text-sm">
            {{ t("solarNetwork.features.subscription.desc") }}
          </p>
        </div>
        <div
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:-translate-y-2 p-6 group"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <Sparkles class="w-5 h-5 text-primary" />
            </div>
            <h3 class="text-base font-bold text-primary">
              {{ t("solarNetwork.features.more.title") }}
            </h3>
          </div>
          <p class="opacity-80 text-sm">
            {{ t("solarNetwork.features.more.desc") }}
          </p>
        </div>
      </div>
    </section>

    <div class="divider"></div>

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
                class="btn btn-primary rounded-full shadow-[0_0_20px_rgba(150,158,207,0.5)] hover:shadow-[0_0_30px_rgba(150,158,207,0.7)] hover:scale-105 transition-all"
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
                class="btn btn-primary rounded-full shadow-[0_0_20px_rgba(150,158,207,0.5)] hover:shadow-[0_0_30px_rgba(150,158,207,0.7)] hover:scale-105 transition-all"
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
                  class="btn btn-primary rounded-full shadow-[0_0_20px_rgba(150,158,207,0.5)] hover:shadow-[0_0_30px_rgba(150,158,207,0.7)] hover:scale-105 transition-all"
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
                  <Github class="w-5 h-5" />
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
                  class="btn btn-primary rounded-full shadow-[0_0_20px_rgba(150,158,207,0.5)] hover:shadow-[0_0_30px_rgba(150,158,207,0.7)] hover:scale-105 transition-all"
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
                  class="btn btn-primary rounded-full shadow-[0_0_20px_rgba(150,158,207,0.5)] hover:shadow-[0_0_30px_rgba(150,158,207,0.7)] hover:scale-105 transition-all"
                >
                  <ExternalLink class="w-5 h-5" />
                  {{ t("solarNetwork.download.direct") }}
                </a>
                <a
                  href="https://github.com/Solsynth/Solian/releases"
                  target="_blank"
                  class="btn btn-outline rounded-full"
                >
                  <Github class="w-5 h-5" />
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
                  class="btn btn-primary rounded-full shadow-[0_0_20px_rgba(150,158,207,0.5)] hover:shadow-[0_0_30px_rgba(150,158,207,0.7)] hover:scale-105 transition-all"
                >
                  <ExternalLink class="w-5 h-5" />
                  {{ t("solarNetwork.download.direct") }}
                </a>
                <a
                  href="https://github.com/Solsynth/Solian/releases"
                  target="_blank"
                  class="btn btn-outline rounded-full"
                >
                  <Github class="w-5 h-5" />
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
            <Github class="w-4 h-4" />
            {{ t("solarNetwork.journey.viewGithub") }}
          </a>
        </div>
      </div>
    </section>

    <div class="divider"></div>

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
              class="btn btn-outline btn-lg hover:scale-105 transition-transform"
            >
              <Bug class="w-5 h-5" />
              {{ t("solarNetwork.help.reportIssue") }}
            </a>
            <a
              href="https://github.com/Solsynth/Solian/discussions"
              target="_blank"
              class="btn btn-ghost btn-lg hover:scale-105 transition-transform"
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

.hero-glow {
  color: var(--color-base-content);
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 30px rgba(255, 255, 255, 0.4),
    0 0 60px rgba(150, 158, 207, 0.3);
}

:deep(.dark) .hero-glow {
  color: white;
}
</style>
