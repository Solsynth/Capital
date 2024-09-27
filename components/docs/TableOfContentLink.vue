<template>
  <v-list-item :active="route.hash.replace('#', '') == link.id" :to="{ hash: '#'+link.id }">
    <template #prepend>
      <v-icon icon="mdi-menu-right" :style="`padding-left: ${props.padding ?? 0}rem`" />
    </template>
    {{ link.text }}
  </v-list-item>
</template>

<script setup lang="ts">
const props = defineProps<{ link: any, padding?: number }>()

const route = useRoute()
</script>
