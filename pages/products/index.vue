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
              <nuxt-link :to="item.link" target="_blank">
                <v-btn variant="text" color="teal" prepend-icon="mdi-launch">
                  Launch
                </v-btn>
              </nuxt-link>
              <nuxt-link :to="'/products/' + item.slug">
                <v-btn variant="text" prepend-icon="mdi-page-next">
                  Learn more
                </v-btn>
              </nuxt-link>
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
