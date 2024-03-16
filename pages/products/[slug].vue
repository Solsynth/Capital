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

        <v-card-text tag="article" class="prose max-w-none">
          <content-renderer :value="product">
            <template #empty>
              <p>No content found.</p>
            </template>
          </content-renderer>
        </v-card-text>

        <v-divider class="mx-[-20px] my-4 border-opacity-75" />

        <div class="mt-3 flex justify-between items-center">
          <p class="ps-3.5 text-sm">
            {{ new Date(product?.date).toLocaleString() }}
          </p>

          <div>
            <v-btn
              v-if="product?.source"
              variant="text"
              color="info"
              prepend-icon="mdi-code-tags"
              target="_blank"
              :href="product?.source"
            >
              Source code
            </v-btn>
            <v-btn
              variant="text"
              color="teal"
              prepend-icon="mdi-launch"
              target="_blank"
              :href="product?.link"
            >
              Launch
            </v-btn>
          </div>
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
