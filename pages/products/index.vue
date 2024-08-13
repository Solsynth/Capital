<template>
  <v-container class="content-container mx-auto">
    <v-card v-for="item in products" class="mb-3" :to="item._path">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-img :src="item.thumbnail" :aspect-ratio="16/9" class="rounded-md" cover />
          </v-col>
          <v-col cols="12" md="8" class="flex flex-col">
            <h2 class="text-xl">{{ item.title }}</h2>
            <span>{{ item.description }}</span>
            <v-chip
              v-if="item?.archived"
              label
              prepend-icon="mdi-archive"
              variant="text"
              color="warning"
              size="small"
              class="mx-[-6px]"
            >
              {{ t("productArchived") }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { getLocale } from "~/utils/locale"

useHead({
  title: "Products",
})

const { t } = useI18n()

const { data: products } = await useAsyncData("products", () => {
  return queryContent("/products").where({ _locale: getLocale() }).find()
})
</script>

<style scoped>
.content-container {
  max-width: 65ch !important;
}
</style>
