<template>
  <v-container>
    <div class="max-w-[720px] mx-auto flex flex-col gap-2">
      <v-card v-for="item in products">
        <v-row class="pa-5">
          <v-col :xs="12" :md="3">
            <img :src="item.icon" width="128" height="128" class="mx-auto" />
          </v-col>
          <v-col :xs="12" :md="9">
            <h2 class="text-xl font-medium">{{ item.name }}</h2>
            <p class="font-mono text-sm">{{ item.code }}</p>
            <p class="mt-3 opacity-80">{{ item.description }}</p>
            <div class="mt-3 flex justify-end">
              <v-btn
                variant="text"
                color="teal"
                prepend-icon="mdi-launch"
                target="_blank"
                :href="item.link"
              >
                Launch
              </v-btn>
              <v-btn
                variant="text"
                prepend-icon="mdi-page-next"
                :href="'/products/' + item.slug"
              >
                Learn more
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const { data: products } = await useAsyncData("products", () =>
  queryContent("products").find()
);
</script>
