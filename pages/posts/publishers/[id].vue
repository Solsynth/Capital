<template>
  <v-container class="content-container mx-auto">
    <div class="my-3 mx-[3.5ch]">
      <h1 class="text-2xl">{{ t("navPosts") }}</h1>
      <span>{{ t("navPostsCaptionWithPublisher", [publisher.data.name]) }}</span>
    </div>

    <post-list v-if="publisher.type == 'realm'" :realm="route.params.id?.toString()" />
    <post-list v-else :author="route.params.id?.toString()" />
  </v-container>
</template>

<script setup lang="ts">
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

<style scoped>
.content-container {
  max-width: 70ch !important;
}
</style>
