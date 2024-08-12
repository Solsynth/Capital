<template>
  <v-container class="flex flex-col gap-[4rem] my-[2rem]">
    <v-row class="content-section">
      <v-col cols="12" md="4" class="flex justify-start">
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
    <v-row class="content-section">
      <v-col cols="12" md="8">
        <v-card class="max-h-[500px]">
          <activity-carousel class="carousel-section" />
        </v-card>
      </v-col>
      <v-col cols="12" md="4" class="flex justify-end" order="first" order-md="last">
        <div class="text-right">
          <h1 class="text-4xl font-bold">Activities</h1>
          <p class="text-lg mt-3">
            Keep in touch, <br />
            and learn what we doing recently.
          </p>
          <p class="text-grey mt-2">
            <v-icon icon="mdi-arrow-left" size="16" class="mb-0.5" />
            See some posts in our realm just here
          </p>
        </div>
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
