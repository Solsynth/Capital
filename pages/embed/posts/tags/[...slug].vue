<template>
  <div>
    <div class="my-3" v-if="!route.query['no-title']">
      <h1 class="text-2xl">{{ route.query["title"] ?? t("navPosts") }}</h1>
      <span>{{ route.query["caption"] ?? t("navPostsCaptionWithTag", [route.params.slug?.toString()]) }}</span>
    </div>

    <post-list class="mx-[-2.5ch]" :tag="route.params.slug?.toString()" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "embed",
})

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
