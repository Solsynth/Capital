<template>
  <nuxt-link v-bind="props" />
</template>

<script setup lang="ts">
const props = defineProps<{ to: string; target: string }>();
</script>
