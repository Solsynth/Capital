<template>
  <v-container class="content-container mx-auto">
    <div class="my-3 mx-[3.5ch]">
      <h1 class="text-2xl">{{ t("navPosts") }}</h1>
      <span>{{ t("navPostsCaptionWithRealm", [`#${route.params.id}`]) }}</span>
    </div>

    <post-list :realm="route.params.id?.toString()" />
  </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n()

const route = useRoute()

if(Number.isNaN(parseInt(route.params.id?.toString()))) {
  throw createError({
    statusCode: 400,
    statusMessage: "Realm ID must be a Number",
  })
}

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
