<template>
  <v-container class="content-container mx-auto">
    <v-card v-for="item in terms" class="mb-3" :to="item._path">
      <v-card-text>
        <h2 class="text-xl">{{ item.title }}</h2>
        <span>{{ item.description }}</span>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { getLocale } from "~/utils/locale"

useHead({
  title: "Terms",
})

const { data: terms } = await useAsyncData("terms", () => {
  return queryContent("/terms").where({ _locale: getLocale() }).find()
})
</script>

<style scoped>
.content-container {
  max-width: 65ch !important;
}
</style>
