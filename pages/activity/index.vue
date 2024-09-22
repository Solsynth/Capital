<template>
  <v-container class="content-container mx-auto">
    <div class="my-3 mx-[1.5ch]">
      <div class="flex gap-1">
        <h1 class="text-2xl">{{ t("navActivity") }}</h1>
        <v-btn size="x-small" variant="text" icon="mdi-rss" slim to="/activity/feed" />
      </div>
      <span>{{ t("navActivityCaption") }}</span>
    </div>

    <post-list class="mx-[-2.5ch]" :realm="config.public.solarRealm" />
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
</script>

<style scoped>
.content-container {
  max-width: 70ch !important;
}
</style>
