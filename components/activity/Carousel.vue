<template>
  <v-carousel v-if="!loading" show-arrows="hover" cycle hide-delimiters progress="primary">
    <v-carousel-item v-for="(item, i) in items" :key="i">
      <v-sheet color="rgba(0, 0, 0, .4)"  class="h-full w-full flex items-center justify-center post-container overflow-scroll">
        <post-item class="mt-5 mb-2" force-show-content :post="item" />
      </v-sheet>
    </v-carousel-item>
  </v-carousel>
  <div v-else class="w-full h-full flex items-center justify-center">
    <v-progress-circular indeterminate />
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const items = ref<any[]>([])

const loading = ref(false)

async function load() {
  loading.value = true

  const res = await fetch(`${config.public.solarNetworkApi}/cgi/co/posts?take=5&realmId=${config.public.solarRealmId}`)
  const result = await res.json()

  items.value.push(...result.data)

  loading.value = false
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.post-container::-webkit-scrollbar {
  display: none;
}

.post-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
