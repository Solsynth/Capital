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

      <v-dialog max-width="540" v-model="dialogOpen" close-on-content-click>
        <v-card title="Table of Contents" density="compact">
          <div class="mt-[-12px]">
            <docs-table-of-contents v-if="page.body.toc.links?.length > 0" :links="page.body.toc.links" />
            <v-empty-state v-else text="No Headers Available" />
          </div>
        </v-card>
      </v-dialog>

      <v-fab
        app
        appear
        location="bottom end"
        :key="'docs-fab-'+dialogOpen"
        :icon="dialogOpen ? 'mdi-arrow-collapse-right' : 'mdi-menu'"
        @click="dialogOpen = !dialogOpen"
      />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports"

const route = useRoute()

const { t } = useI18n()
const { data: page } = await useAsyncData<any>("page", queryContent(route.path).where({ _locale: getLocale() }).findOne)

const drawerTab = ref(0)
const dialogOpen = ref(false)

if (page.value == null) {
  throw createError({
    status: 404,
    statusMessage: "Document Page Not Found",
  })
}

definePageMeta({
  layout: "docs",
})

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
.docs-article {
  padding-bottom: 2rem;
}

.docs-content {
  max-width: 75ch;
  margin: 0 auto;
}
</style>

<style>
.docs-article img {
  border-radius: 8px;
  border: 1px solid #eee;
  transition: box-shadow .3s ease-in-out;
}

.docs-article img:hover {
  box-shadow: 2px 2px 2px rgba(0, 0, 0, .2);;
}


html, body, .v-application, .docs-article {
  scroll-behavior: smooth;
}
</style>
