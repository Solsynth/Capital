<script setup lang="ts">
const localePath = useLocalePath()
const route = useRoute()
const slug = route.params.slug as string

navigateTo(localePath(`/legal/${slug}`))
</script>

<template>
  <div />
</template>
