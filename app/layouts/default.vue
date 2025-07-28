<template>
  <n-layout class="h-screen">
    <n-layout-header class="border-b-1">
      <div class="flex justify-between items-center container mx-auto">
        <router-link to="/" class="text-lg font-bold"> Solsynth </router-link>
      </div>
    </n-layout-header>

    <n-layout-content>
      <slot />
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutContent } from "naive-ui";
</script>

<style scoped>
.n-layout-header {
  padding: 8px 24px;
  border-color: var(--n-border-color);
  height: 57px; /* Fixed height */
  display: flex;
  align-items: center;
}

.n-layout-content {
  height: calc(100vh - 57px); /* Adjust based on header height */
}
</style>
