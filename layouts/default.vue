<template>
  <v-app-bar flat color="primary">
    <v-container class="mx-auto d-flex align-center justify-center px-8">
      <nuxt-link to="/" exact>
        <v-avatar class="me-4" color="transparent" size="32" :image="Logo" />
      </nuxt-link>

      <v-btn variant="text" text="Products" to="/products" exact />

      <v-spacer></v-spacer>

      <v-btn href="https://id.solsynth.dev" target="_blank" icon>
        <v-avatar size="small" color="transparent" icon="mdi-account-circle" />
      </v-btn>
    </v-container>
  </v-app-bar>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
import Logo from "../assets/logo.png"
</script>
