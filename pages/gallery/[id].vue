<template>
  <v-row class="h-[calc(100vh-24px)]" no-gutters>
    <v-col cols="12" md="8">
      <div class="h-full w-full flex justify-center items-center" :class="isMediumScreen ? 'flex-row' : 'flex-col'">
        <div class="flex-grow-1 w-full">
          <attachment-renderer :item="attachment" no-cover />
        </div>
        <v-divider v-if="isMediumScreen" vertical />
        <v-divider v-else />
      </div>
    </v-col>
    <v-col cols="12" md="4" class="px-5 pt-3">
      <div class="mt-3 mb-4.5 mx-[2.5ch] flex flex-row gap-4 items-center">
        <nuxt-link :to="`/users/${attachment.account?.name}`">
          <v-avatar :image="attachment.account?.avatar" />
        </nuxt-link>
        <div class="flex flex-col">
          <span class="text-xs">Uploaded by</span>
          <span>{{ attachment.account?.nick }} <span class="text-xs">@{{ attachment.account?.name }}</span></span>
        </div>
      </div>

      <v-card class="mb-5">
        <v-card-text class="flex flex-col gap-4">
          <div class="flex flex-col" v-if="attachment?.alt">
            <span class="text-xs font-bold">Alternative</span>
            <span class="text-truncate">{{ attachment?.alt }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold">Original File Name</span>
            <span class="text-truncate">{{ attachment?.name }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold">Size</span>
            <span>{{ formatBytes(attachment?.size) }}</span>
          </div>
          <div class="flex flex-col" v-if="attachment?.metadata?.ratio">
            <span class="text-xs font-bold">Aspect Ratio</span>
            <span>
            {{ attachment?.metadata?.width }}x{{ attachment?.metadata?.height }}
            {{ attachment?.metadata?.ratio.toFixed(2) }}
          </span>
          </div>
          <div class="flex flex-col" v-if="attachment?.mimetype">
            <span class="text-xs font-bold">Mimetype</span>
            <span>{{ attachment?.mimetype }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold">Raw Data</span>
            <v-code class="font-mono mt-1">{{ JSON.stringify(attachment.metadata, null, 4) }}</v-code>
          </div>
        </v-card-text>
      </v-card>

      <div class="text-xs text-grey flex flex-col mx-[2.5ch]">
        <span>Solar Network Attachment Web Preview</span>
        <span>Powered by <a class="underline" target="_blank" href="https://git.solsynth.dev/Hydrogen/Paperclip">Hydrogen.Paperclip</a></span>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify"

const route = useRoute()
const config = useRuntimeConfig()

const firstImage = ref<string | null>()
const firstVideo = ref<string | null>()

const isMediumScreen = useDisplay().mdAndUp

const { data: attachment } = await useFetch<any>(`${config.public.solarNetworkApi}/cgi/uc/attachments/${route.params.id}/meta`)

definePageMeta({
  layout: "minimal",
})

if (!attachment.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Attachment Not Found",
  })
}

const title = computed(() => `Attachment from ${attachment.value.account.nick}`)

watch(attachment, (value) => {
  if (value.mimetype.split("/")[0] == "image") {
    firstImage.value = `${config.public.solarNetworkApi}/cgi/uc/attachments/${value.id}`
  }

  if (value.mimetype.split("/")[0] == "video") {
    firstVideo.value = `${config.public.solarNetworkApi}/cgi/uc/attachments/${value.id}`
  }
}, { immediate: true, deep: true })

useHead({
  title: title.value,
  titleTemplate: "%s on Solar Network",
  link: [
    { rel: "icon", type: "image/png", href: "/icon-solar-network.png" },
    { rel: "apple-touch-icon", type: "image/png", href: "/icon-solar-network.png" },
  ],
})

useSeoMeta({
  author: attachment.value?.account.nick,
  title: title,
  description: attachment.value?.alt,
  ogTitle: title,
  ogDescription: attachment.value?.alt,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${route.fullPath}`,
  ogImage: firstImage,
  ogVideo: firstVideo,
  publisher: "Solar Network",
  ogSiteName: "Solsynth Capital",
})

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
</script>
