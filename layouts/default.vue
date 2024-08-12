<template>
  <v-app-bar flat color="primary">
    <v-container fluid class="mx-auto d-flex align-center justify-center px-8">
      <nuxt-link to="/" exact>
        <v-avatar class="me-4 ms-1" color="transparent" size="32" :image="Logo" />
      </nuxt-link>

      <div class="nav-links overflow-y-auto flex">
        <v-btn variant="text" text="Products" to="/products" exact />
        <v-btn variant="text" text="Activity" to="/activity" exact />
        <v-btn variant="text" text="Gallery" to="/gallery" exact />
      </div>

      <v-spacer></v-spacer>

      <user-menu />
    </v-container>
  </v-app-bar>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
import Logo from "../assets/logo-w-shadow.png"
</script>

<style scoped>
.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-links {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
