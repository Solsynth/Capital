<template>
  <v-container class="content-container mx-auto">
    <div class="my-3 mx-[3.5ch]">
      <h1 class="text-2xl">{{ t("navPosts") }}</h1>
      <span>{{ t("navPostsCaptionWithTag", [`#${route.params.slug}`]) }}</span>
    </div>

    <post-list :tag="route.params.slug?.toString()" />
  </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n()

const route = useRoute()

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
