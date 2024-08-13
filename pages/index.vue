<template>
  <v-container class="flex flex-col my-2 gap-[4rem]">
    <v-row class="content-section">
      <v-col cols="12" md="4" class="flex justify-start">
        <div class="flex flex-col items-start">
          <h1 class="text-4xl font-bold">{{ t("brandName") }}</h1>
          <p class="text-lg mt-3 max-w-2/3">
            {{ t("indexIntroduce") }}
          </p>
          <p class="text-grey mt-2">
            {{ t("indexProductListHint") }}
            <v-icon icon="mdi-arrow-right" size="16" class="mb-0.5" />
          </p>
        </div>
      </v-col>
      <v-col cols="12" md="8">
        <v-card>
          <product-carousel class="carousel-section" :products="products as any[]" />
        </v-card>
      </v-col>
    </v-row>
    <v-row class="content-section">
      <v-col cols="12" md="8">
        <v-card class="max-h-[500px]">
          <activity-carousel class="carousel-section" />
        </v-card>
      </v-col>
      <v-col cols="12" md="4" class="flex justify-end" order="first" order-md="last">
        <div class="text-right flex flex-col items-end">
          <h1 class="text-4xl font-bold">{{ t("indexActivities") }}</h1>
          <p class="text-lg mt-3 max-w-2/3">
            {{ t("indexActivitiesCaption") }}
          </p>
          <p class="text-grey mt-2">
            <v-icon icon="mdi-arrow-left" size="16" class="mb-0.5" />
            {{ t("indexActivitiesHint") }}
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n()

const { data: products } = await useAsyncData("products", () => queryContent("/products").where({ archived: { $ne: true } }).limit(5).find())
</script>

<style scoped>
.carousel-section {
  height: 96rem;
}

.content-section {
  height: calc(100vh - 80px);
  display: flex;
  place-items: center;
}
</style>
