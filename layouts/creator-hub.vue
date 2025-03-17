<template>
  <v-app-bar flat color="primary" scroll-behavior="hide" scroll-threshold="800">
    <v-container fluid class="mx-auto d-flex align-center justify-center px-8">
      <v-app-bar-nav-icon @click="openDrawer = !openDrawer" />

      <nuxt-link to="/creator" exact>
        <h2>Creator Hub</h2>
      </nuxt-link>

      <v-spacer></v-spacer>

      <locale-select />
      <user-menu />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="openDrawer" location="left" width="300" floating>
    <v-list density="compact" nav color="primary">
      <v-list-item title="Back" prepend-icon="mdi-arrow-left" to="/" exact />
    </v-list>

    <v-divider class="border-opacity-50 my-1" />

    <v-list density="compact" nav color="primary">
      <v-list-item title="Stickers" prepend-icon="mdi-sticker-emoji" to="/creator/stickers" exact />
    </v-list>

    <v-divider class="border-opacity-50 mb-4 mt-1" />

    <copyright no-centered service="capital" class="px-5" />

    <footer-links class="px-5 mt-3" />
  </v-navigation-drawer>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
const { t } = useI18n()
const openDrawer = ref(false)

useHead({
  titleTemplate: "%s | Solsynth Creator Hub",
})
</script>
