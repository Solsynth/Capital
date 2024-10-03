<template>
  <v-card v-if="!loading" density="compact" variant="outlined">
    <div class="h-[500px] overflow-y-auto no-scrollbar">
      <div v-for="item in items" class="mt-5 mb-2">
        <post-item :key="item.id" force-show-content :post="item" />
      </div>
      <div class="mt-4 mb-5 flex justify-center">
        <v-btn :text="t('seeMore')" size="small" variant="text" to="/activity" />
      </div>
    </div>
  </v-card>
  <v-card v-else density="compact" variant="outlined">
    <div class="w-full h-full flex items-center justify-center">
      <v-progress-circular indeterminate />
    </div>
  </v-card>
</template>

<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const items = ref<any[]>([])

const loading = ref(false)

async function load() {
  loading.value = true

  const res = await fetch(`${config.public.solarNetworkApi}/cgi/co/posts?take=5&realm=${config.public.solarRealm}`)
  const result = await res.json()

  items.value.push(...result.data)

  loading.value = false
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  width: 0;
  display: none;
}
</style>
