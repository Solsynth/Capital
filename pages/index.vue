<template>
  <v-container>
    <v-row class="h-fullpage" align-content="center" id="landing">
      <v-col :xs="12" :sm="6" class="max-md:text-center">
        <img
          src="/assets/products/solar.svg"
          class="w-[180px] h-[192px] max-md:mx-auto"
        />
        <h1 class="text-6xl font-bold mt-8">
          <span class="text-primary">Internet.</span> <br />
          <span>Redefined.</span>
        </h1>

        <p class="text-lg mt-3">This is, the Solar Network.</p>

        <div class="mt-12 w-full flex max-md:justify-center">
          <v-btn
            append-icon="mdi-magnify"
            variant="tonal"
            size="large"
            href="#about"
          >
            Explore more
          </v-btn>
        </div>
      </v-col>

      <v-col
        :xs="12"
        :sm="6"
        class="flex items-center max-md:justify-center md:justify-end"
      >
        <v-card class="w-full">
          <img src="/assets/products/feature.jpg" class="object-cover" />
        </v-card>
      </v-col>
    </v-row>

    <v-row class="h-fullpage" align-content="center" id="about">
      <v-col :xs="12" :sm="6" class="max-md:text-center">
        <v-icon
          icon="mdi-information-slab-symbol"
          size="48"
          color="grey-darken-3"
          class="mb-3 mx-[-16px]"
        />
        <h1 class="text-2xl font-bold">About us</h1>
        <p>
          We are a group of developers who are love open-source. Founded in
          2019. We've been building open-source software that people love ever
          since. For us, "By open-source, for open-source" is not only a
          principle, but also the motto of our faith.
        </p>

        <div class="mt-3 w-full flex max-md:justify-center">
          <v-btn
            class="mx-[-16px]"
            append-icon="mdi-shape"
            variant="text"
            href="#products"
          >
            Discover products
          </v-btn>
        </div>
      </v-col>

      <v-col
        :xs="12"
        :sm="6"
        class="flex flex-col gap-2 max-md:items-center md:items-end"
      >
        <v-card hover class="pa-5">
          <template #text>
            <img src="/favicon.svg" width="128" height="128" />
          </template>
        </v-card>
        <p class="uppercase caption">Crystal Lotus</p>
        <p class="text-sm opacity-80 mt-[-8px] md:text-right">
          A crystal flower born in GoatLand. <br />
          Home flower of Solsynth. <br />
          Mr. Sheep felt homesick every time he saw it.
        </p>
      </v-col>
    </v-row>

    <v-row
      class="h-fullpage text-center"
      align-content="center"
      justify="center"
      id="products"
    >
      <v-col :cols="12">
        <h2 class="text-2xl font-bold">Products</h2>
        <p>Let's see what we got.</p>

        <div class="mt-4 flex justify-center gap-2">
          <v-tooltip v-for="item in products" location="top">
            <template #activator="{ props }">
              <v-card v-bind="props" hover class="w-24 h-24" :href="'/products/' + item.slug">
                <div class="h-full w-full flex justify-center items-center">
                  <img :src="item.icon" width="64" height="64" class="block" />
                </div>
              </v-card>
            </template>

            <div>
              <p class="font-bold">{{ item.title }}</p>
              <p class="font-mono text-xs">{{ item.code }}</p>
              <p class="mt-2">{{ item.description }}</p>
            </div>
          </v-tooltip>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { data: products } = await useAsyncData("products", () =>
  queryContent("products").limit(5).find()
);
</script>

<style scoped>
.h-fullpage {
  height: calc(100vh - 64px);
}

.caption {
  letter-spacing: 2px;
}
</style>
