<template>
  <v-container class="content-container mx-auto">
    <div class="mt-5">
      <h1 class="text-4xl">{{ page.title }}</h1>
      <span>{{ t("lastUpdatedAt", [new Date(page.date).toLocaleDateString()]) }}</span>
    </div>

    <article class="text-base prose xl:text-lg mx-auto">
      <content-renderer :value="page">
        <content-renderer-markdown :value="page" />
      </content-renderer>
    </article>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()

const { t } = useI18n()
const { data: page } = await useAsyncData<any>("page", queryContent(route.path).where({ _locale: getLocale() }).findOne)

if (page.value == null) {
  throw createError({
    status: 404,
    statusMessage: "Term Not Found",
  })
}

useHead({
  title: page.value.title,
})

useSeoMeta({
  title: page.value.title,
  ogTitle: page.value.title,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${route.fullPath}`,
  publisher: "Solar Network",
  ogSiteName: "Solsynth Capital",
})
</script>

<style scoped>
.content-container {
  max-width: 65ch !important;
}
</style>
