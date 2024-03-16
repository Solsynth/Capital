<template>
  <v-app-bar flat scroll-behavior="elevated">
    <v-container class="mx-auto d-flex align-center justify-center">
      <v-avatar
        class="me-4"
        color="transparent"
        size="32"
        image="/favicon.svg"
      ></v-avatar>

      <v-btn v-for="link in navbars" variant="text" :href="link.to">
        {{ link.label }}
      </v-btn>

      <v-spacer></v-spacer>
    </v-container>
  </v-app-bar>

  <v-main class="bg-grey-lighten-3 min-h-[calc(100vh - 64px)]">
    <suspense>
      <slot />
    </suspense>
  </v-main>
</template>

<script setup lang="ts">
import RouterLink from "~/components/RouterLink.vue";

const navbars = [
  { label: "Home", to: "/" },
  { label: "Posts", to: "/posts" },
  { label: "Products", to: "/products" },
];
</script>
