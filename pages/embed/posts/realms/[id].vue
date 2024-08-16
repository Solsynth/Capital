<template>
  <div>
    <div class="my-3" v-if="!route.query['no-title']">
      <h1 class="text-2xl">{{ route.query["title"] ?? t("navPosts") }}</h1>
      <span>{{ route.query["caption"] ??  t("navPostsCaptionWithRealm", [`#${route.params.id}`]) }}</span>
    </div>

    <post-list class="mx-[-2.5ch]" :realm-id="parseInt(route.params.id?.toString())" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "embed",
})

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
