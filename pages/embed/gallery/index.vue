<template>
  <div>
    <div class="mt-3 mb-6.5 mx-[3.5ch] text-center">
      <h1 class="text-2xl">{{ t("navGallery") }}</h1>
      <span>{{ t("navGalleryCaption") }}</span>
    </div>

    <div class="album">
      <v-card v-for="item in items" class="album-item mb-3" :to="`/gallery/${item.id}`">
        <attachment-renderer :item="item" />
      </v-card>

      <div class="flex p-5 justify-center items-center">
        <v-btn variant="outlined" text="Load more" :loading="loading" @click="load" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "embed",
})

const { t } = useI18n()

useHead({
  title: t("navGallery"),
})

useSeoMeta({
  title: t("navGallery"),
  ogTitle: t("navGallery"),
  description: t("navGalleryCaption"),
  ogDescription: t("navGalleryCaption"),
  ogType: "website",
})

const config = useRuntimeConfig()

const items = ref<any[]>([])
const loading = ref(false)

async function load() {
  loading.value = true

  const res = await fetch(`${config.public.solarNetworkApi}/cgi/files/attachments?take=20&offset=${items.value.length}&original=true`)
  const result = await res.json()

  items.value.push(...result.data)

  loading.value = false
}

onMounted(() => {
  load()
})
</script>
