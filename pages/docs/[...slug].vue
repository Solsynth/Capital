<template>
  <v-container class="px-12 docs-page-container">
    <div class="docs-container">
      <div class="docs-content">
        <div class="mt-5">
          <div class="flex gap-2 items-center">
            <v-icon :icon="page.icon ?? 'mdi-text-box'" size="28" />
            <h1 class="text-2xl">{{ page.title }}</h1>
          </div>
          <p>{{ page.description }}</p>
        </div>

        <article class="text-base prose xl:text-lg docs-article">
          <content-renderer :value="page">
            <content-renderer-markdown :value="page" />
          </content-renderer>
        </article>
      </div>

      <div class="docs-widgets">
        <v-card title="Table of Contents" prepend-icon="mdi-table-of-contents" density="comfortable">
          <div class="mt-[-8px]">
            <docs-table-of-contents :links="page.body.toc.links" />
          </div>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()

const { t } = useI18n()
const { data: page } = await useAsyncData<any>("page", queryContent(route.path).where({ _locale: getLocale() }).findOne)

if (page.value == null) {
  throw createError({
    status: 404,
    statusMessage: "Document Page Not Found",
  })
}

useHead({
  title: page.value.title,
  titleTemplate: "%s | Solsynth Knowledge Base",
})

useSeoMeta({
  title: page.value.title,
  ogTitle: page.value.title,
  description: page.value.description,
  ogDescription: page.value.description,
  ogUrl: `${useRuntimeConfig().public.siteUrl}${route.fullPath}`,
  publisher: "Solar Archive",
  ogSiteName: "Solsynth Capital",
})
</script>

<style scoped>
.docs-page-container {
  position: relative;
}

.docs-container {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.docs-content {
  flex: 1 360px;
}

.docs-article {
  padding-bottom: 2rem;
}

.docs-widgets {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

<style>
.docs-article img {
  border-radius: 8px;
}

html, body, .v-application, .docs-article {
  scroll-behavior: smooth;
}
</style>
