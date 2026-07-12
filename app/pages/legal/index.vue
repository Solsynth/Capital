<script setup lang="ts">
import { FileText, Scale, Shield, Code, ChevronRight, Calendar } from '@lucide/vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const lang = computed(() => locale.value)

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => `${t('seo.legal.title')}`,
  description: () => t('seo.legal.description'),
})

defineOgImage('UniOgImage', {
  title: t('legal.title'),
  description: t('seo.legal.description'),
})

useSchemaOrg([
  defineWebPage({
    name: () => t('seo.legal.title'),
    description: () => t('seo.legal.description'),
    url: () => `https://solsynth.dev${route.path}`,
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t('seo.home.title'),
        item: 'https://solsynth.dev',
      },
      {
        name: t('seo.legal.title'),
        item: () => `https://solsynth.dev${route.path}`,
      },
    ],
  }),
])

const { data: currentLangPages } = await useAsyncData(`legal-list-${lang.value}`, async () => {
  const pages = await queryCollection('legal')
    .where('path', 'LIKE', `/legal/${lang.value}/%`)
    .all()

  return pages.map(p => ({
    path: p.path,
    title: p.title || '',
    description: p.description || '',
    updatedDate: p.updatedDate || '',
  }))
})

function getSlug(path: string): string {
  return path.replace(/^\/legal\/(en|zh)\//, '')
}

function getIcon(slug: string) {
  if (slug.includes('privacy'))
    return Shield
  if (slug.includes('user'))
    return Scale
  if (slug.includes('refund'))
    return FileText
  return Code
}
</script>

<template>
  <div>
    <section class="border-b border-base-200 px-4 py-16 md:py-20">
      <div class="container mx-auto max-w-3xl">
        <h1 class="mb-3 text-4xl font-extrabold tracking-tight md:text-5xl">
          {{ t('legal.title') }}
        </h1>
        <p class="max-w-xl text-lg text-base-content/65 md:text-xl">
          {{ t('legal.subtitle') }}
        </p>
      </div>
    </section>

    <section class="px-4 py-12">
      <div class="container mx-auto max-w-3xl">
        <div
          v-if="!currentLangPages?.length"
          class="rounded-lg border border-dashed border-base-300 px-6 py-12 text-center text-base-content/50"
        >
          {{ t('legal.subtitle') }}
        </div>

        <div v-else class="divide-y divide-base-200 rounded-lg border border-base-200">
          <NuxtLink
            v-for="page in currentLangPages"
            :key="page.path"
            :to="localePath(`/legal/${getSlug(page.path)}`)"
            class="group flex items-start gap-4 px-5 py-5 transition-colors duration-150 hover:bg-base-200/40"
          >
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-base-200 bg-base-200/50">
              <component
                :is="getIcon(getSlug(page.path))"
                class="h-4 w-4 text-base-content/65"
              />
            </div>

            <div class="min-w-0 flex-1">
              <h2 class="text-base font-semibold transition-colors group-hover:text-primary md:text-lg">
                {{ page.title }}
              </h2>
              <p v-if="page.description" class="mt-1 text-sm text-base-content/60">
                {{ page.description }}
              </p>
              <p
                v-if="page.updatedDate"
                class="mt-2 flex items-center gap-1.5 text-xs text-base-content/45"
              >
                <Calendar class="h-3 w-3" />
                {{ lang === 'zh' ? t('legal.lastUpdatedZh') : t('legal.lastUpdated') }}
                {{ page.updatedDate }}
              </p>
            </div>

            <ChevronRight class="mt-1 h-4 w-4 shrink-0 text-base-content/30 transition-colors group-hover:text-base-content/55" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
