<template>
  <div class="container max-w-lg mx-auto my-16">
    <h1 class="text-4xl font-bold mb-4">Terms and Conditions</h1>
    <nuxt-link v-for="term in terms" :key="term.path" :to="term.path">
      <n-card :title="term.title" hoverable class="mb-4 mx-[-8px]">
        <p>{{ term.description }}</p>

        <template #footer>
          <p class="text-xs">
            Last updated at
            {{ new Date(term.updatedDate).toLocaleDateString() }}
          </p>
        </template>
      </n-card>
    </nuxt-link>
  </div>
</template>

<script setup>
import { NCard } from "naive-ui";
const { data: terms } = await useAsyncData("terms", () =>
  queryCollection("terms").order("updatedDate", "DESC").all(),
);
</script>

<style scoped>
/* Styling for the terms listing page */
</style>
