<template>
  <v-container>
    <div class="max-w-[720px] mx-auto flex flex-col gap-3">
      <v-card v-for="item in posts">
        <v-img
          v-if="item.thumbnail"
          cover
          class="align-end"
          height="180"
          :src="item.thumbnail"
        />
        <div class="py-5 px-7">
          <h2 class="text-xl font-medium">{{ item.title }}</h2>
          <p class="mt-3 opacity-80">{{ item.description }}</p>
          <div class="mt-3 flex justify-end">
            <v-btn
              variant="text"
              prepend-icon="mdi-page-next"
              :href="'/posts/' + item.slug"
            >
              Read more
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const { data: posts } = await useAsyncData("posts", () =>
  queryContent("posts").find()
);

definePageMeta({
  alias: ["/posts"]
})
</script>
