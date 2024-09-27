<template>
  <template v-for="link in links">
    <docs-table-of-content-link :link="link" :padding="props.padding" />

    <table-of-content-links v-if="link.children" :links="link.children" :padding="(props.padding ?? 0) + 2" />
  </template>
</template>

<script setup lang="ts">
const props = defineProps<{ links: any[], padding?: number }>()
</script>
