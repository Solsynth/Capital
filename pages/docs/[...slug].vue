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

      <v-navigation-drawer app v-model="drawerOpen" floating location="right" width="320">
        <v-tabs v-model="drawerTab" hide-slider align-tabs="center">
          <v-tab :value="1">
            <v-icon icon="mdi-table-of-contents" />
          </v-tab>
          <v-tab :value="2">
            <v-icon icon="mdi-information" />
          </v-tab>
        </v-tabs>

        <v-divider class="border-opacity-50 mb-1" />

        <v-tabs-window v-model="drawerTab">
          <v-tabs-window-item :value="1">
            <docs-table-of-contents v-if="page.body.toc.links?.length > 0" :links="page.body.toc.links" />
            <v-empty-state v-else text="No Headers Available" />
          </v-tabs-window-item>
          <v-tabs-window-item :value="2">
            <div class="flex flex-col gap-2">
              <div>
                <p><b>Created By</b></p>
              </div>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-navigation-drawer>

      <v-fab
        app
        appear
        location="bottom end"
        variant="plain"
        :key="'docs-fab-'+drawerOpen"
        :icon="drawerOpen ? 'mdi-arrow-collapse-right' : 'mdi-menu'"
        @click="drawerOpen = !drawerOpen"
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
const drawerOpen = ref(false)

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
}


html, body, .v-application, .docs-article {
  scroll-behavior: smooth;
}
</style>
