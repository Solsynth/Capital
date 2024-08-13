<template>
  <v-container class="content-container mx-auto">
    <div class="my-3 mx-[3.5ch]">
      <h1 class="text-2xl">{{ t("navActivity") }}</h1>
      <span>{{ t("navActivityCaption") }}</span>
    </div>

    <v-infinite-scroll :items="items" :onLoad="load">
      <template v-for="item in items" :key="item">
        <post-item :post="item" />
      </template>
    </v-infinite-scroll>
  </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: t("navActivity"),
})

useSeoMeta({
  title: t("navActivity"),
  ogTitle: t("navActivity"),
  description: t("navActivityCaption"),
  ogDescription: t("navActivityCaption"),
  ogType: "website",
})

const config = useRuntimeConfig()

const items = ref<any[]>([])

async function load({ done }: any) {
  const res = await fetch(`${config.public.solarNetworkApi}/cgi/interactive/posts?take=10&offset=${items.value.length}&realmId=${config.public.solarRealmId}`)
  const result = await res.json()

  items.value.push(...result.data)

  done("ok")
}
</script>

<style scoped>
.content-container {
  max-width: 70ch !important;
}
</style>
