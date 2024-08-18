<template>
  <div>
    <div class="my-3" v-if="!route.query['no-title']">
      <h1 class="text-2xl">{{ route.query["title"] ?? t("navPosts") }}</h1>
      <span>{{ route.query["caption"] ??  t("navPostsCaptionWithPublisher", [publisher.data.name]) }}</span>
    </div>

    <post-list v-if="publisher.type == 'realm'" class="mx-[-2.5ch]" :realm="route.params.id?.toString()" />
    <post-list v-else class="mx-[-2.5ch]" :author="route.params.id?.toString()" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "embed",
})

const { t } = useI18n()

const route = useRoute()
const config = useRuntimeConfig()

const { data: publisher } = useFetch<any>(`${config.public.solarNetworkApi}/cgi/co/publishers/${route.params.id}`)

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
