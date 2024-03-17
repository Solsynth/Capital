<template>
  <v-container>
    <div class="max-w-[720px] mx-auto">
      <v-card>
        <v-img
          v-if="post?.thumbnail"
          cover
          class="align-end"
          height="180"
          :src="post?.thumbnail"
        />

        <div class="pa-5">
          <v-card-text class="pt-0 pb-1">
            <h2 class="text-xl font-medium">{{ post?.title }}</h2>
            <p class="opacity-80">{{ post?.description }}</p>
          </v-card-text>

          <v-divider class="mx-[-20px] mt-3 border-opacity-75" />

          <v-card-text tag="article" class="prose max-w-none">
            <content-renderer :value="post">
              <template #empty>
                <p>No content found.</p>
              </template>
            </content-renderer>
          </v-card-text>

          <v-divider class="mx-[-20px] mb-4 border-opacity-75" />

          <div class="mt-3 flex justify-between items-center">
            <p class="ps-3.5 text-sm">
              {{ new Date(post?.date).toLocaleString() }}
            </p>
          </div>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute();

const { data: post } = await useAsyncData("post", () =>
  queryContent("posts").where({ slug: route.params.slug }).findOne()
);
</script>
