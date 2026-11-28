<script setup lang="ts">
const { monochrome = false } = defineProps<{
  monochrome?: boolean
}>()
</script>

<template>
  <svg
    viewBox="0 0 640 640"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M183.98 320.33A214 214 0 1 1 312 458.67A137.5 137.5 0 0 0 183.98 320.33Z"
      fill="currentColor"
    />
    <path
      d="M312 458.67A137.5 137.5 0 1 1 183.98 320.33A214 214 0 0 0 312 458.67Z"
      :fill="monochrome ? 'currentColor' : '#f98900'"
    />
  </svg>
</template>
