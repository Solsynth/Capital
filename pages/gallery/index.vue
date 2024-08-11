<template>
  <v-container fluid>
    <div class="mt-3 mb-6.5 mx-[3.5ch] text-center">
      <h1 class="text-2xl">Gallery</h1>
      <span>Explore files that uploaded by Solar Network users.</span>
    </div>

    <div class="album">
      <v-card v-for="item in items" class="album-item mb-3" :to="`/gallery/${item.id}`">
        <attachment-renderer :item="item" />
      </v-card>

      <div class="flex p-5 justify-center items-center">
        <v-btn variant="outlined" text="Load more" :loading="loading" @click="load" />
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
useHead({
  title: 'Gallery',
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

function getAttachmentUrl(id: number) {
  return `${config.public.solarNetworkApi}/cgi/files/attachments/${id}`
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
