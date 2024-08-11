<template>
  <v-container fluid>
    <div class="mt-3 mb-6.5 mx-[3.5ch] text-center">
      <h1 class="text-2xl">Gallery</h1>
      <span>Explore files that uploaded by Solar Network users.</span>
    </div>

    <div class="album">
      <v-card v-for="item in items" class="album-item mb-3">
        <v-img v-if="item.mimetype.split('/')[0] == 'image'" :src="getAttachmentUrl(item.id)" class="w-full h-full"
               cover />
        <video v-else-if="item.mimetype.split('/')[0] == 'video'" :src="getAttachmentUrl(item.id)" class="w-full h-full"
               controls />
        <v-sheet v-else color="rgba(0, 0, 0, .4)" height="calc(100% + 24px)" class="p-5">
          <v-row class="fill-height" align="center" justify="center">
            <v-col class="text-center">
              <h1 class="text-xl font-bold text-white">
                {{ item.alt }}
              </h1>
              <p class="text-md text-white">{{ item.mimetype }}</p>

              <p class="text-sm text-white mt-3">Unable to preview, you can open it via other ways.</p>

              <div class="flex justify-center mt-3">
                <v-btn
                  variant="text"
                  color="white"
                  prepend-icon="mdi-launch"
                  text="Open in browser"
                  :href="getAttachmentUrl(item.id)"
                  target="_blank"
                />
              </div>
            </v-col>
          </v-row>
        </v-sheet>
      </v-card>

      <div class="flex p-5 justify-center items-center">
        <v-btn variant="outlined" text="Load more" :loading="loading" @click="load" />
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
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
