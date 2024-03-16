<template>
  <v-container>
    <div class="max-w-[720px] mx-auto">
      <v-card class="pa-5">
        <template #title>
          <span class="me-2">{{ product?.name }}</span>
          <span class="font-mono text-xs">{{ product?.code }}</span>
        </template>
        <template #subtitle>{{ product?.description }}</template>

        <v-divider class="mx-[-20px] my-3 border-opacity-75" />

        <v-card-text>
          <content-renderer :value="product">
            <template #empty>
              <p>No content found.</p>
            </template>
          </content-renderer>
        </v-card-text>

        <v-divider class="mx-[-20px] my-3 border-opacity-75" />

        <div class="mt-3 flex justify-end">
          <nuxt-link v-if="product?.source" :to="product?.source" target="_blank">
            <v-btn variant="text" color="info" prepend-icon="mdi-code-tags">
              Source code
            </v-btn>
          </nuxt-link>
          <nuxt-link :to="product?.link" target="_blank">
            <v-btn variant="text" color="teal" prepend-icon="mdi-launch">
              Launch
            </v-btn>
          </nuxt-link>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute();

const { data: product } = await useAsyncData("product", () =>
  queryContent("products").where({ slug: route.params.slug }).findOne()
);
</script>
