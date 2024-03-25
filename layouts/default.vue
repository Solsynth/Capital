<template>
  <v-app-bar flat scroll-behavior="elevated">
    <v-container class="mx-auto d-flex align-center justify-center">
      <v-avatar
        class="me-4"
        color="transparent"
        size="32"
        image="/favicon.png"
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
const navbars = [
  { label: "Home", to: "/" },
  { label: "Newsletters", to: "/newsletters" },
  { label: "Products", to: "/products" },
];
</script>
