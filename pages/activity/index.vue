<template>
  <v-container class="content-container mx-auto">
    <div class="my-3 mx-[3.5ch]">
      <h1 class="text-2xl">{{ t("navActivity") }}</h1>
      <span>{{ t("navActivityCaption") }}</span>
    </div>

    <post-list :realm="config.public.solarRealm" />
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
