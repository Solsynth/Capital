<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  description: '',
})

useSeoMeta({
  title: () => `${t('seo.about.title')} - ${t('seo.siteName')}`,
  description: () => t('seo.about.description'),
})

defineOgImage('OgImage.takumi', {
  title: t('about.title'),
  description: t('seo.about.description'),
})
</script>

<template>
  <AboutContent />
</template>
