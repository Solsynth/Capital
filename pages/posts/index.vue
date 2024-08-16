<template>
  <v-container class="content-container mx-auto">
    <div class="my-3 mx-[3.5ch]">
      <h1 class="text-2xl">{{ t("navPosts") }}</h1>
      <span>{{ t("navPostsCaption") }}</span>
    </div>

    <post-list />
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
</script>

<style scoped>
.content-container {
  max-width: 70ch !important;
}
</style>
