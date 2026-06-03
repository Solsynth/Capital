<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'About Us',
  description: '',
})

useSeoMeta({
  description: () => t('seo.about.description'),
})

defineOgImageComponent('OgImage', {
  title: t('about.title'),
  description: t('seo.about.description'),
})
</script>

<template>
  <AboutContent />
</template>
