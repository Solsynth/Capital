<script setup lang="ts">
import { FileText, Scale, Shield, Code } from 'lucide-vue-next'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const lang = computed(() => locale.value)

definePageMeta({
  title: 'Legal',
  description: '',
})

useSeoMeta({
  description: () => t('seo.legal.description'),
})

defineOgImageComponent('OgImage', {
  title: t('legal.title'),
  description: t('seo.legal.description'),
})

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
  if (slug.includes('privacy')) return Shield
  if (slug.includes('user')) return Scale
  if (slug.includes('refund')) return FileText
  return Code
}
</script>

<template>
  <div class="container mx-auto px-4 py-16 max-w-4xl">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ t('legal.title') }}</h1>
      <p class="text-xl opacity-70">
        {{ t('legal.subtitle') }}
      </p>
    </div>

    <div class="space-y-4">
      <NuxtLink
        v-for="page in currentLangPages"
        :key="page.path"
        :to="localePath(`/legal/${getSlug(page.path)}`)"
        class="card bg-base-200 p-6 hover:shadow-lg transition-all duration-300 block group"
      >
        <div class="flex items-start gap-4">
          <div class="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <component :is="getIcon(getSlug(page.path))" class="w-6 h-6 text-primary" />
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold group-hover:text-primary transition-colors">{{ page.title }}</h3>
            <p class="text-sm opacity-70 mt-1">{{ page.description }}</p>
            <p v-if="page.updatedDate" class="text-xs opacity-50 mt-2">
              {{ lang === 'zh' ? t('legal.lastUpdatedZh') : t('legal.lastUpdated') }} {{ page.updatedDate }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
