<template>
  <v-container>
    <v-row class="content-section">
      <v-col cols="12" md="4" class="d-flex align-center">
        <div>
          <h1 class="text-4xl font-bold">Solsynth</h1>
          <p class="text-lg mt-3">
            An energetic software company that create wonderful software which everyone love.
          </p>
          <p class="text-grey mt-2">
            See some of our products just there
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
  </v-container>
</template>

<script setup lang="ts">
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
