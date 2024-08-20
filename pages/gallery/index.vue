<template>
  <v-container fluid>
    <div class="mt-3 mb-6.5 mx-[3.5ch] text-center">
      <h1 class="text-2xl">{{ t("navGallery") }}</h1>
      <p>{{ t("navGalleryCaption") }}</p>
      <v-btn slim size="x-small" prepend-icon="mdi-upload" variant="text" color="info" to="/gallery/new">
        <span>Upload new</span>
      </v-btn>
    </div>

    <div class="album">
      <v-card v-for="item in items" class="album-item mb-3" :to="`/gallery/${item.rid}`">
        <attachment-renderer :item="item" />
      </v-card>
    </div>

    <div class="flex p-5 justify-center items-center">
      <v-btn variant="outlined" text="Load more" :loading="loading" @click="load" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
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

  const res = await fetch(`${config.public.solarNetworkApi}/cgi/uc/attachments?take=20&offset=${items.value.length}&original=true`)
  const result = await res.json()

  items.value.push(...result.data)

  loading.value = false
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.album {
  columns: 20rem;
  column-gap: 1rem;
}
</style>
