<template>
  <v-container class="content-container mx-auto">
    <v-card v-if="page" class="mb-5">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-img :src="page.thumbnail" :aspect-ratio="16/9" class="rounded-md" cover />
          </v-col>
          <v-col cols="12" md="8" class="flex flex-col">
            <h2 class="text-xl">{{ page.title }}</h2>
            <span>{{ page.description }}</span>
            <v-chip
              v-if="page?.archived"
              label
              prepend-icon="mdi-archive"
              variant="text"
              color="warning"
              size="small"
              class="mx-[-6px]"
            >
              {{ t("productArchived") }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <article class="text-base prose xl:text-lg mx-auto">
      <content-renderer :value="page">
        <template #empty>
          <v-empty-state
            icon="mdi-image-broken-variant"
            text="This product has no specific describe for it, yet."
            title="No Content"
            class="no-content-placeholder"
          >
            <template #actions>
              <v-btn prepend-icon="mdi-list-box" variant="plain" text="Back to index" to="/products" exact />
            </template>
          </v-empty-state>
        </template>

        <content-renderer-markdown :value="page" />
      </content-renderer>
    </article>

    <div class="flex justify-start mt-5">
      <v-btn
        v-if="page?.url"
        variant="plain"
        prepend-icon="mdi-launch"
        :text="t('open')"
        :href="page?.url"
        target="_blank"
      />
    </div>
  </v-container>
</template>

<style scoped>
.no-content-placeholder {
  min-height: 0;
  max-height: 64rem;
}
</style>

<script setup lang="ts">
const route = useRoute()

const { t } = useI18n()
const { data: page } = await useAsyncData<any>("page", queryContent(route.path).where({ _locale: getLocale() }).findOne)

if (page.value == null) {
  throw createError({
    status: 404,
    statusMessage: "Product Not Found",
  })
}

useHead({
  title: page.value.title,
})

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
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
