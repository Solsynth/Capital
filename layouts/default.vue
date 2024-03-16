<template>
  <v-app-bar flat scroll-behavior="elevated">
    <v-container class="mx-auto d-flex align-center justify-center">
      <v-avatar
        class="me-4"
        color="transparent"
        size="32"
        image="/favicon.svg"
      ></v-avatar>

      <nuxt-link v-for="link in navbars" :to="link.to">
        <v-btn variant="text">{{ link.label }}</v-btn>
      </nuxt-link>

      <v-spacer></v-spacer>
    </v-container>
  </v-app-bar>

  <v-main class="bg-grey-lighten-3 min-h-[calc(100vh - 64px)]">
    <slot />
  </v-main>
</template>

<script setup lang="ts">
const navbars = [{ label: "Home", to: "/" }];
</script>
