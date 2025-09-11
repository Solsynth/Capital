<template>
  <n-layout class="h-screen">
    <n-layout-header class="app-bar-blur">
      <div class="flex justify-between items-center container mx-auto">
        <router-link to="/" class="text-lg font-bold"> Solsynth </router-link>
        <div class="flex gap-3">
          <router-link to="/terms" class="text-md font-bold">
            Legal
          </router-link>
        </div>
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

.app-bar-blur {
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 40%,
    rgba(0, 0, 0, 0.5) 65%,
    rgba(0, 0, 0, 0) 100%
  );
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 40%,
    rgba(0, 0, 0, 0.5) 65%,
    rgba(0, 0, 0, 0) 100%
  );
  mask-repeat: no-repeat;
  mask-size: 100%;
}
</style>
