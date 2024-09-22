<template>
  <v-container class="content-container mx-auto">
    <div class="my-3 mx-[1.5ch]">
      <h1 class="text-2xl">{{ t("navPosts") }}</h1>
      <span>{{ t("navPostsCaption") }}</span>
    </div>

    <post-list class="mx-[-2.5ch]" />
  </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: t("navPosts"),
})

useSeoMeta({
  title: t("navPosts"),
  ogTitle: t("navPosts"),
  description: t("navPostsCaption"),
  ogDescription: t("navPostsCaption"),
  ogType: "website",
})
</script>

<style scoped>
.content-container {
  max-width: 70ch !important;
}
</style>
