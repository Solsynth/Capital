<template>
  <v-app-bar app flat color="surface" class="app-bar-blur">
    <v-container fluid class="mx-auto d-flex align-center justify-center pr-8">
      <v-app-bar-nav-icon @click="openDrawer = !openDrawer" />

      <nuxt-link to="/" exact>
        <h2>Solsynth LLC</h2>
      </nuxt-link>

      <v-spacer></v-spacer>

      <div class="flex gap-2">
        <v-btn to="/products" exact prepend-icon="mdi-shape">{{ t("navProducts") }}</v-btn>
        <v-btn to="/posts" exact prepend-icon="mdi-note-text">{{ t("navPosts") }}</v-btn>
        <v-btn to="/gallery" exact prepend-icon="mdi-image-multiple">{{ t("navGallery") }}</v-btn>
      </div>

      <v-spacer></v-spacer>

      <locale-select />
      <user-menu />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="openDrawer" location="left" width="300" temporary order="-1">
    <v-list density="compact" nav color="primary">
      <v-list-item title="Knowledge Base" prepend-icon="mdi-library" to="/docs" exact />
      <v-list-item title="Developer Portal" prepend-icon="mdi-code-tags" to="/dev" exact />
      <v-list-item title="Creator Hub" prepend-icon="mdi-pencil" to="/creator" exact />
    </v-list>

    <v-divider class="border-opacity-50 my-1" />

    <v-list density="compact" nav color="primary">
      <v-list-item title="Code Repository" prepend-icon="mdi-git" href="https://git.solsynth.dev" target="_blank" />
    </v-list>

    <v-divider class="border-opacity-50 mb-4 mt-0.5" />

    <copyright no-centered :service="['roadsign', 'capital']" class="px-5" />

    <footer-links class="px-5 mt-3" />
  </v-navigation-drawer>

  <v-main>
    <slot />
  </v-main>
</template>

<script setup lang="ts">
const { t } = useI18n()

const openDrawer = ref(false)
</script>

<style lang="css" scoped>
.app-bar-blur {
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0.5) 65%, rgba(0, 0, 0, 0) 100%);
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0.5) 65%, rgba(0, 0, 0, 0) 100%);
  mask-repeat: no-repeat;
  mask-size: 100%;
}
</style>
