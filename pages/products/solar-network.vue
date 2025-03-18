<template>
  <v-container class="flex flex-col my-2 px-12 gap-[4rem]">
    <section class="content-section flex flex-col items-center justify-center text-center px-4" id="intro">
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
        <v-btn class="mt-4" color="primary" prepend-icon="mdi-arrow-down" href="#products">{{ t("learnMore") }}</v-btn>
      </div>
    </section>

    <section class="content-section flex flex-col items-center justify-center text-center px-4" id="downloads">
      <h1 class="text-3xl font-bold">{{ t("download") }}</h1>
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
      <div class="max-h-[500px] w-full mt-4 text-left">
        <v-row dense>
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
                <p class="text-sm opacity-50 mb-2">{{ t('downloadForApple') }}</p>
                <div class="flex align-center gap-2.5">
                  <nuxt-link
                    to="https://apps.apple.com/us/app/solian/id6499032345?itscg=30200&itsct=apps_box_link&mttnsubad=6499032345"
                    target="_blank"
                  >
                    <img :src="AppStoreDownload" />
                  </nuxt-link>
                  <div>
                    <nuxt-link to="https://testflight.apple.com/join/YJ0lmN6O" target="_blank" class="underline">
                      {{ t('downloadTestFlight') }}
                    </nuxt-link>
                    <p class="text-xs opacity-40">{{ t('downloadTestFlightDescription') }}</p>
                  </div>
                </div>

                <p class="text-sm opacity-50 mt-4">{{ t('downloadForDesktop') }}</p>
                <p class="text-sm">{{ t('downloadForDesktopDescription') }}</p>

                <p class="text-sm opacity-50 mt-4">{{ t('downloadWithoutDownload') }}</p>
                <div class="text-sm flex gap-2 underline">
                  <nuxt-link to="https://sn.solsynth.dev" target="_blank">{{ t('downloadWeb') }}</nuxt-link>
                  <nuxt-link to="https://sn.solsynth.dev?cdn=cn" target="_blank"
                    >{{ t('downloadWebChina') }}</nuxt-link
                  >
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </section>
  </v-container>
</template>

<script lang="ts" setup>
import Icon from "~/assets/products/solar-network/icon.png"
import AlphaScreenshot from "~/assets/products/solar-network/alpha.webp"
import AppStoreDownload from "~/assets/products/app-store-download.svg"

import { formatBytes } from "~/utils/format"
import { Octokit } from "@octokit/rest"

const { t } = useI18n()

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

const showPrerelease = ref(false)

const currentRelease = computed(() => (showPrerelease.value ? latestPrerelease : latestRelease))
const hasPrerelease = computed<boolean>(
  () => latestPrerelease.data?.value?.tag_name != latestRelease.data?.value?.tag_name,
)
</script>

<style scoped>
.content-section {
  min-height: calc(100vh - 80px);
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
