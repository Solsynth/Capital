<template>
  <v-container class="flex flex-col my-2 px-12 gap-[4rem]">
    <section class="content-section flex flex-col items-center justify-center text-center" id="intro">
      <div class="pt-1/3 mb-4 w-full relative">
        <img :src="AlphaScreenshot" class="absolute bottom-2 left-0 right-0" />
        <img
          v-motion="{
            initial: {
              y: 100,
              opacity: 0,
            },
            enter: {
              y: 0,
              opacity: 1,
              transition: { duration: 0.8 },
            },
          }"
          :src="Icon"
          alt="Solar Network Logo"
          class="w-32 h-32 p-2 z-10 mx-auto icon-glow bg-white dark:bg-black shadow-2xl rounded-xl"
        />
      </div>
      <div>
        <h1 class="text-4xl font-bold">Solar Network</h1>
        <p class="mt-2 text-lg">{{ t("solarNetworkDescription") }}</p>
        <v-btn class="mt-4" color="primary" prepend-icon="mdi-arrow-down" href="#features">{{ t("learnMore") }}</v-btn>
      </div>
    </section>

    <section class="content-section flex flex-col items-center justify-center text-center" id="features">
      <h2 class="text-3xl font-bold">{{ t("solarNetworkFeat") }}</h2>
      <p class="text-lg mb-4">{{ t("solarNetworkFeatDescription") }}</p>

      <v-card class="w-full">
        <v-tabs v-model="featuresTab" align-tabs="center" color="primary">
          <v-tab
            :prepend-icon="feat.icon"
            :text="feat.title"
            :value="feat.icon"
            v-for="feat in features"
            @mouseover="featuresTab = feat.icon"
          />
        </v-tabs>

        <v-tabs-window v-model="featuresTab">
          <v-tabs-window-item :value="feat.icon" v-for="feat in features">
            <v-card flat>
              <v-img :aspect-ratio="16 / 9" :src="feat.image" cover></v-img>

              <v-card-text>
                <p class="text-lg mb-1">
                  {{ feat.description }}
                </p>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>
    </section>

    <section class="content-section flex flex-col items-center justify-center" id="highlight-posts">
      <v-row class="w-full" dense>
        <v-col cols="12" md="6">
          <div
            class="max-h-[500px] overflow-y-auto posts-container"
            ref="highlight-posts"
            v-if="highlightPosts.status.value === 'success'"
          >
            <div v-for="post in highlightPosts.data.value">
              <post-item :post="post" force-show-content class="mx-0" />
            </div>
          </div>
          <v-progress-circular v-else indeterminate />
        </v-col>
        <v-col cols="12" md="6" class="text-right">
          <h2 class="text-3xl font-bold">{{ t("solarNetworkHighlightPosts") }}<sup>®</sup></h2>
          <p>{{ t("solarNetworkHighlightPostsDescription") }}</p>
          <v-btn variant="text" color="white" slim prepend-icon="mdi-plus" href="#reminders">{{
            t("solarNetworkJumpIn")
          }}</v-btn>
        </v-col>
      </v-row>
    </section>

    <section class="content-section flex flex-col items-center justify-center text-center" id="reminders">
      <h2 class="text-3xl font-bold">{{ t("solarNetworkBeforeYouStart") }}</h2>
      <p class="text-lg">{{ t("solarNetworkBeforeYouStartDescription") }}</p>

      <div class="max-h-[500px] w-full mt-4 text-left">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-card :title="t('solarNetworkFreedomOfSpeech')" prepend-icon="mdi-account-voice" density="comfortable">
              <v-card-text>{{ t("solarNetworkFreedomOfSpeechDescription") }}</v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card :title="t('solarNetworkConfirmAccount')" prepend-icon="mdi-account-check" density="comfortable">
              <v-card-text>{{ t("solarNetworkConfirmAccountDescription") }}</v-card-text>
            </v-card>
            <v-card
              :title="t('solarNetworkNoImpersonation')"
              prepend-icon="mdi-account-cancel"
              density="comfortable"
              class="mt-2"
            >
              <v-card-text>{{ t("solarNetworkNoImpersonationDescription") }}</v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card :title="t('solarNetworkReadDialog')" prepend-icon="mdi-alert-circle" density="comfortable">
              <v-card-text>{{ t("solarNetworkReadDialogDescription") }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <p class="text-sm mt-4">{{ t("solarNetworkToS") }}</p>
      <nuxt-link class="underline text-sm" to="/terms">{{ t("solarNetworkToSCheck") }}</nuxt-link>
    </section>

    <section class="content-section flex flex-col items-center justify-center text-center" id="downloads">
      <h3 class="text-3xl font-bold">{{ t("download") }}</h3>
      <p class="text-lg">
        File-hosting & versioning by
        <nuxt-link class="underline" to="https://github.com/Solsynth/HyperNet.Surface" target="_blank">GitHub</nuxt-link
        ><sup>®</sup>
      </p>
      <v-btn
        v-if="hasPrerelease"
        slim
        density="compact"
        prepend-icon="mdi-beta"
        variant="text"
        style="text-transform: none"
        color="white"
        @click="showPrerelease = !showPrerelease"
      >
        {{ showPrerelease ? t("downloadSwitchRelease") : t("downloadSwitchPrerelease") }}
      </v-btn>
      <div class="w-full mt-4 text-left">
        <v-row dense class="flex-1">
          <v-col cols="12" md="6">
            <v-card
              prepend-icon="mdi-alert-decagram"
              :title="showPrerelease ? 'Latest pre-release' : 'Latest release'"
              density="comfortable"
            >
              <v-card-text v-if="currentRelease.status.value === 'success'">
                <p class="text-xs">
                  <code>{{ currentRelease.data.value?.tag_name }}</code>
                </p>
                <p class="font-bold text-lg">{{ latestRelease.data.value?.name }}</p>
                <article class="prose prose-sm max-h-[360px] overflow-y-auto" style="max-width: unset">
                  <m-d-c :value="currentRelease.data.value!.body!" />
                </article>
              </v-card-text>
              <div v-else>
                <v-progress-circular class="px-5 my-3" indeterminate />
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card prepend-icon="mdi-download" title="Distributions" density="comfortable">
              <div v-if="currentRelease.status.value === 'success'">
                <v-list density="comfortable" slim>
                  <v-list-item
                    v-for="asset in currentRelease.data.value!.assets"
                    :key="asset.id"
                    :title="asset.label ?? asset.name"
                    :subtitle="formatBytes(asset.size)"
                    :href="asset.browser_download_url"
                    target="_blank"
                  />
                </v-list>
              </div>
              <div v-else>
                <v-progress-circular class="px-5 my-3" indeterminate />
              </div>
              <v-card-text>
                <p class="text-sm opacity-50 mb-2">{{ t("downloadForApple") }}</p>
                <div class="flex align-center gap-2.5">
                  <nuxt-link
                    to="https://apps.apple.com/us/app/solian/id6499032345?itscg=30200&itsct=apps_box_link&mttnsubad=6499032345"
                    target="_blank"
                  >
                    <img :src="AppStoreDownload" />
                  </nuxt-link>
                  <div>
                    <nuxt-link to="https://testflight.apple.com/join/YJ0lmN6O" target="_blank" class="underline">
                      {{ t("downloadTestFlight") }}
                    </nuxt-link>
                    <p class="text-xs opacity-40">{{ t("downloadTestFlightDescription") }}</p>
                  </div>
                </div>

                <p class="text-sm opacity-50 mt-4">{{ t("downloadForDesktop") }}</p>
                <p class="text-sm">{{ t("downloadForDesktopDescription") }}</p>

                <p class="text-sm opacity-50 mt-4">{{ t("downloadWithoutDownload") }}</p>
                <div class="text-sm flex gap-2 underline">
                  <nuxt-link to="https://sn.solsynth.dev" target="_blank">{{ t("downloadWeb") }}</nuxt-link>
                  <nuxt-link to="https://sn.solsynth.dev?cdn=cn" target="_blank">{{ t("downloadWebChina") }}</nuxt-link>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </section>

    <section class="content-section flex flex-col items-center justify-center" id="help">
      <h2 class="text-2xl font-bold text-center mb-4">{{ t("solarNetworkNeedHelp") }}</h2>
      <div class="flex flex-col gap-2 w-[480px] max-w-screen">
        <v-card :title="t('askHelpContactUs')" prepend-icon="mdi-email-fast" density="comfortable">
          <v-card-text>
            Contact our customer server at
            <nuxt-link to="mailto:lily@solsynth.dev" class="underline">
              <address>lily@solsynth.dev</address>
            </nuxt-link>
          </v-card-text>
        </v-card>
        <v-card :title="t('askHelpReadTheDocs')" prepend-icon="mdi-page-next" density="comfortable">
          <v-card-text class="flex flex-col">
            <nuxt-link to="https://kb.solsynth.dev" class="underline">Visit Goatpedia</nuxt-link>
            <nuxt-link to="https://github.com/Solsynth/HyperNet.Surface/issues" class="underline"
              >Visit GitHub Issue Tracker</nuxt-link
            >
          </v-card-text>
        </v-card>
      </div>
    </section>

    <copyright :service="['capital', 'roadsign']" />
  </v-container>
</template>

<script lang="ts" setup>
import Icon from "~/assets/products/solar-network/icon.png"
import AlphaScreenshot from "~/assets/products/solar-network/alpha.webp"
import ScreenshotDashboard from "~/assets/products/solar-network/ft-dashboard.png"
import ScreenshotExplore from "~/assets/products/solar-network/ft-explore.png"
import ScreenshotChat from "~/assets/products/solar-network/ft-chat.png"
import ScreenshotNews from "~/assets/products/solar-network/ft-news.png"
import ScreenshotStickers from "~/assets/products/solar-network/ft-stickers.png"
import ScreenshotCompose from "~/assets/products/solar-network/ft-posting.png"
import AppStoreDownload from "~/assets/products/app-store-download.svg"

useHead({
  title: "Solar Network",
})

import { formatBytes } from "~/utils/format"
import { Octokit } from "@octokit/rest"

const { t } = useI18n()

const featuresTab = ref()

interface FeatureItem {
  title: string
  description: string
  icon: string
  image: string
}

const features: FeatureItem[] = [
  {
    title: t("solarNetworkFeatDashboard"),
    description: t("solarNetworkFeatDashboardDescription"),
    icon: "mdi-view-dashboard",
    image: ScreenshotDashboard,
  },
  {
    title: t("solarNetworkFeatExplore"),
    description: t("solarNetworkFeatExploreDescription"),
    icon: "mdi-compass",
    image: ScreenshotExplore,
  },
  {
    title: t("solarNetworkFeatChat"),
    description: t("solarNetworkFeatChatDescription"),
    icon: "mdi-chat",
    image: ScreenshotChat,
  },
  {
    title: t("solarNetworkFeatNews"),
    description: t("solarNetworkFeatNewsDescription"),
    icon: "mdi-newspaper",
    image: ScreenshotNews,
  },
  {
    title: t("solarNetworkFeatStickers"),
    description: t("solarNetworkFeatStickersDescription"),
    icon: "mdi-sticker",
    image: ScreenshotStickers,
  },
  {
    title: t("solarNetworkFeatCompose"),
    description: t("solarNetworkFeatComposeDescription"),
    icon: "mdi-pencil",
    image: ScreenshotCompose,
  },
]

const latestRelease = useAsyncData("sn-latest-release", async () => {
  const octo = new Octokit({})
  const resp = await octo.repos.getLatestRelease({
    owner: "Solsynth",
    repo: "HyperNet.Surface",
  })
  return resp.data
})
const latestPrerelease = useAsyncData("sn-latest-prerelease", async () => {
  const octo = new Octokit({})
  const resp = await octo.repos.listReleases({
    owner: "Solsynth",
    repo: "HyperNet.Surface",
    per_page: 1,
  })
  return resp.data[0]
})

const highlightPosts = useAsyncData("sn-highlight-posts", async () => {
  const resp = await solarFetch("/cgi/co/recommendations")
  const data = await resp.json()
  return data
})

const showPrerelease = ref(false)

const currentRelease = computed(() => (showPrerelease.value ? latestPrerelease : latestRelease))
const hasPrerelease = computed<boolean>(
  () => latestPrerelease.data?.value?.tag_name != latestRelease.data?.value?.tag_name,
)

const highlightPostContainer = useTemplateRef("highlight-posts")

function autoScroll() {
  console.log("Auto scroll is called.")

  const scrollSpeed = 1
  let animationFrameId: number
  let isScrolling = true

  function scroll() {
    if (!isScrolling) return
    const container = highlightPostContainer.value!

    if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
      container.scroll(0, 0)
    } else {
      container.scrollBy(0, scrollSpeed)
    }
    animationFrameId = requestAnimationFrame(scroll)
  }

  scroll()

  const container = highlightPostContainer.value!
  container.addEventListener("mouseenter", () => {
    isScrolling = false
    cancelAnimationFrame(animationFrameId)
  })
  container.addEventListener("mouseleave", () => {
    if (!isScrolling) {
      isScrolling = true
      scroll()
    }
  })
}

watch(
  highlightPostContainer,
  (data) => {
    if (data != null) {
      autoScroll()
    }
  },
  { immediate: true, deep: true },
)
</script>

<style scoped>
.posts-container {
  padding-top: 20px;
  padding-bottom: 20px;
  position: relative;
  height: 500px;
  overflow: hidden;
  scrollbar-width: none;
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 20%,
    rgba(0, 0, 0, 1) 80%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 20%,
    rgba(0, 0, 0, 1) 80%,
    rgba(0, 0, 0, 0) 100%
  );
}

.posts-container::-webkit-scrollbar {
  display: none;
}

.content-section {
  min-height: calc(100vh - 80px);
  height: auto;
  display: flex;
  place-items: center;
}

.icon-glow {
  -webkit-filter: drop-shadow(0 0 7px rgba(0, 0, 0, 0.5));
  filter: drop-shadow(0 0 7px rgba(0, 0, 0, 0.5));
}

@media (prefers-color-scheme: dark) {
  .icon-glow {
    -webkit-filter: invert() drop-shadow(0 0 7px rgba(255, 255, 255, 0.5));
    filter: invert() drop-shadow(0 0 7px rgba(255, 255, 255, 0.5));
  }
}
</style>

<style>
body,
html {
  scroll-behavior: smooth;
}
</style>
