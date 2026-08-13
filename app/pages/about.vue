<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => `${t('seo.about.title')}`,
  description: () => t('seo.about.description'),
})

defineOgImage('UniOgImage', {
  title: t('about.title'),
  description: t('seo.about.description'),
})

// Schema.org Structured Data for About Page
useSchemaOrg([
  defineOrganization({
    name: 'Solsynth',
    url: 'https://solsynth.dev',
    logo: 'https://solsynth.dev/favicon-64.png',
    description: () => t('seo.about.description'),
    sameAs: ['https://github.com/solsynth'],
  }),
  defineBreadcrumb({
    itemListElement: [
      {
        name: t('seo.home.title'),
        item: 'https://solsynth.dev',
      },
      {
        name: t('seo.about.title'),
        item: () => `https://solsynth.dev${localePath('/about')}`,
      },
    ],
  }),
])
</script>

<template>
  <AboutContent />
</template>
